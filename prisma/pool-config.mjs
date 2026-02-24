/**
 * Shared pool configuration helper for Prisma seed files.
 * Provides SSL configuration for DigitalOcean managed databases in production.
 */

/**
 * Add PgBouncer connection parameter if connecting via PgBouncer.
 * PgBouncer in transaction mode requires pgbouncer=true parameter.
 * This is automatically added if the URL contains port 6432 (PgBouncer default port).
 * 
 * @param {string} url - Database connection URL
 * @returns {string} URL with pgbouncer parameter if needed
 */
export function ensurePgBouncerParam(url) {
  if (!url) return url;
  
  // Check if URL is using PgBouncer port (6432)
  const isPgBouncer = url.includes(':6432/');
  
  if (isPgBouncer && !url.includes('pgbouncer=')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}pgbouncer=true`;
  }
  
  return url;
}

/**
 * Get PostgreSQL pool configuration with SSL enabled for production.
 * Uses DATABASE_CA_CERT environment variable for DigitalOcean managed databases.
 * 
 * Mirrors the logic from EnvService.getPoolConfig in the main application:
 * - Parses the URL into individual fields (host, port, database, user, password)
 * - Normalizes PEM: trims, removes surrounding quotes, handles double-escaped newlines from K8s
 * 
 * @param {string} connectionString - Database connection URL
 * @returns {object} Pool configuration object with SSL when in production
 */
export function getPoolConfig(connectionString) {
  const url = new URL(connectionString);
  const poolConfig = {
    host: url.hostname,
    port: parseInt(url.port, 10),
    database: url.pathname.slice(1),
    user: url.username,
    password: decodeURIComponent(url.password),
  };
  
  // Add SSL configuration for production when DATABASE_CA_CERT is set
  if (process.env.NODE_ENV === 'production') {
    let caCert = process.env.DATABASE_CA_CERT;
    
    // Normalize PEM: trim and convert escaped newlines to real newlines (env/K8s compatibility)
    if (caCert) {
      caCert = caCert.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
      
      poolConfig.ssl = {
        rejectUnauthorized: true,
        ca: caCert,
      };
    } else {
      console.warn('Production mode but DATABASE_CA_CERT is not set - SSL connections may fail');
    }
  }
  
  return poolConfig;
}
