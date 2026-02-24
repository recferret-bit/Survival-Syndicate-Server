import { z } from 'zod';

export const ExchangeRateSchema = z.object({
  currency: z.string().length(3, 'Currency code must be 3 characters'),
  rate: z.number().positive('Exchange rate must be positive'),
});

export const GetExchangeRatesRequestSchema = z.object({
  base: z.string().length(3, 'Base currency must be 3 characters'),
  currencies: z
    .array(z.string().length(3))
    .min(1, 'At least one currency required'),
});

export const GetExchangeRatesResponseSchema = z.object({
  exchangeRates: z.array(ExchangeRateSchema),
});

export const EmptyResponseSchema = z.object({
  success: z.boolean().optional(),
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;
export type GetExchangeRatesRequest = z.infer<
  typeof GetExchangeRatesRequestSchema
>;
export type GetExchangeRatesResponse = z.infer<
  typeof GetExchangeRatesResponseSchema
>;
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;

/**
 * Subject definitions for NATS
 */
export const ExchangeRateSubjects = {
  GET_EXCHANGE_RATES: 'exchangeRate.rates.get',
  RUN_SET_EXCHANGE_RATES: 'exchangeRate.rates.set',
} as const;

export type ExchangeRateSubject =
  (typeof ExchangeRateSubjects)[keyof typeof ExchangeRateSubjects];
