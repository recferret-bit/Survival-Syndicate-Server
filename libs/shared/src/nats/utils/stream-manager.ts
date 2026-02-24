import { JetStreamManager, RetentionPolicy, StorageType } from 'nats';
import { Logger } from '@nestjs/common';
import {
  NATS_ERROR_CODES,
  DEFAULT_TIMEOUTS,
  DEFAULT_STREAM_LIMITS,
} from './constants';

export interface StreamConfig {
  maxAge?: number;
  maxMsgs?: number;
  maxBytes?: number;
  /** Retention policy. Use Interest for broadcast (multiple consumers per subject); Workqueue for load-balancing (one consumer per message). */
  retention?: RetentionPolicy;
}

/**
 * Check if old stream subjects overlap with any of our subjects
 * @param oldSubjects - Subjects from existing stream
 * @param currentSubjects - Subjects we want to use
 * @returns true if there's any overlap
 */
export function hasOverlappingSubjects(
  oldSubjects: string[],
  currentSubjects: string[],
): boolean {
  return oldSubjects.some((oldSubj) => {
    if (oldSubj.includes('>')) {
      // Wildcard pattern - check if ANY of our subjects match
      const prefix = oldSubj.replace(/>.*$/, '');
      return currentSubjects.some((s) => s.startsWith(prefix));
    } else {
      // Exact match
      return currentSubjects.includes(oldSubj);
    }
  });
}

/**
 * Delete all consumers from a stream
 */
export async function deleteAllConsumers(
  jsm: JetStreamManager,
  streamName: string,
  logger: Logger,
): Promise<void> {
  try {
    const consumerList = jsm.consumers.list(streamName);
    let deletedCount = 0;

    for await (const consumer of consumerList) {
      try {
        await jsm.consumers.delete(streamName, consumer.name);
        deletedCount++;
      } catch (consumerError: unknown) {
        const message =
          consumerError instanceof Error
            ? consumerError.message
            : String(consumerError);
        logger.warn(`Could not delete consumer '${consumer.name}': ${message}`);
      }
    }
  } catch (_listError: unknown) {
    // Stream may not exist - ignore
  }
}

/**
 * Check if old stream exists and delete it if it overlaps with current subjects
 */
export async function deleteOldStreamIfOverlapping(
  jsm: JetStreamManager,
  streamName: string,
  allSubjects: string[],
  logger: Logger,
): Promise<void> {
  try {
    const oldStreamInfo = await jsm.streams.info(streamName);
    const oldSubjects = oldStreamInfo.config.subjects || [];

    if (hasOverlappingSubjects(oldSubjects, allSubjects)) {
      logger.warn(
        `CRITICAL: Old stream '${streamName}' has overlapping subjects (${oldSubjects.join(', ')}) ` +
          `that would intercept messages for handlers: ${allSubjects.join(', ')}. ` +
          `This affects BOTH durable and non-durable handlers. Attempting to delete...`,
      );

      // Delete consumers first
      await deleteAllConsumers(jsm, streamName, logger);

      // Delete the stream
      try {
        await jsm.streams.delete(streamName);
      } catch (deleteError: unknown) {
        const deleteMsg =
          deleteError instanceof Error
            ? deleteError.message
            : String(deleteError);
        logger.error(
          `CRITICAL: Could not delete old stream '${streamName}': ${deleteMsg}. ` +
            `This stream WILL intercept messages including non-durable ones! ` +
            `Please manually delete it using: nats stream delete ${streamName}`,
        );
        throw new Error(
          `Cannot start service: old stream '${streamName}' must be deleted to prevent message interception. ` +
            `Please delete manually: nats stream delete ${streamName}`,
        );
      }
    }
  } catch (infoError: unknown) {
    // Stream doesn't exist - that's fine
    const err = infoError as { code?: string; message?: string };
    if (
      err.code === NATS_ERROR_CODES.STREAM_NOT_FOUND ||
      err.code === NATS_ERROR_CODES.STREAM_NOT_FOUND_ALT
    ) {
      return;
    }
    // Some other error - log but don't fail startup
    const message =
      infoError instanceof Error ? infoError.message : String(infoError);
    logger.warn(`Could not check for old stream '${streamName}': ${message}`);
  }
}

/**
 * Get stream configuration with defaults
 */
export function getStreamConfig(config?: StreamConfig) {
  return {
    retention: config?.retention ?? RetentionPolicy.Workqueue,
    storage: StorageType.File,
    max_age: config?.maxAge || DEFAULT_TIMEOUTS.STREAM_MAX_AGE_NS,
    max_msgs: config?.maxMsgs || DEFAULT_STREAM_LIMITS.MAX_MSGS,
    max_bytes: config?.maxBytes || DEFAULT_STREAM_LIMITS.MAX_BYTES,
  };
}

/**
 * Create or verify JetStream stream exists
 */
export async function createStream(
  jsm: JetStreamManager,
  streamName: string,
  subjects: string[],
  config: StreamConfig | undefined,
  logger: Logger,
): Promise<void> {
  try {
    await jsm.streams.add({
      name: streamName,
      subjects,
      ...getStreamConfig(config),
    });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === NATS_ERROR_CODES.STREAM_EXISTS) {
      // Stream already exists - check if retention differs (e.g. Workqueue vs Interest for broadcast)
      const requestedRetention = getStreamConfig(config).retention;
      try {
        const info = await jsm.streams.info(streamName);
        if (info.config.retention !== requestedRetention) {
          logger.warn(
            `Stream '${streamName}' has retention ${info.config.retention} but ${requestedRetention} is required. Deleting and recreating...`,
          );
          await deleteAllConsumers(jsm, streamName, logger);
          await jsm.streams.delete(streamName);
          await jsm.streams.add({
            name: streamName,
            subjects,
            ...getStreamConfig(config),
          });
        }
      } catch (infoError: unknown) {
        const infoErr = infoError as { code?: string };
        if (
          infoErr.code === NATS_ERROR_CODES.STREAM_NOT_FOUND ||
          infoErr.code === NATS_ERROR_CODES.STREAM_NOT_FOUND_ALT
        ) {
          // Race: stream was deleted between exists check and info - recreate
          await jsm.streams.add({
            name: streamName,
            subjects,
            ...getStreamConfig(config),
          });
        } else {
          throw infoError;
        }
      }
    } else if (err.code === NATS_ERROR_CODES.SUBJECTS_OVERLAP) {
      throw new Error(
        `Subjects overlap with existing stream. Please delete old stream manually: nats stream delete ${streamName}`,
      );
    } else if (
      err.code === '400' &&
      err.message?.includes('already in use with a different configuration')
    ) {
      // Stream exists with different configuration - delete and recreate
      logger.warn(
        `Stream '${streamName}' exists with different configuration. Deleting and recreating...`,
      );
      try {
        // Delete consumers first
        await deleteAllConsumers(jsm, streamName, logger);
        // Delete the stream
        await jsm.streams.delete(streamName);

        // Recreate with new configuration
        await jsm.streams.add({
          name: streamName,
          subjects,
          ...getStreamConfig(config),
        });
      } catch (deleteError: unknown) {
        const deleteMsg =
          deleteError instanceof Error
            ? deleteError.message
            : String(deleteError);
        logger.error(
          `Failed to delete and recreate stream '${streamName}': ${deleteMsg}`,
        );
        throw new Error(
          `Cannot create stream '${streamName}': existing stream has different configuration and could not be deleted. ` +
            `Please delete manually: nats stream delete ${streamName}`,
        );
      }
    } else {
      logger.error(`Failed to create stream '${streamName}'`, error);
      throw error;
    }
  }
}
