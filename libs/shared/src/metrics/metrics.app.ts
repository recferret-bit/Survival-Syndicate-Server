import * as http from 'node:http';
import { register } from 'prom-client';

export class MetricsApp {
  static async createAndListen(port: string): Promise<http.Server> {
    const server = http.createServer(async (req, res) => {
      if (req.url === '/metrics' && req.method === 'GET') {
        res.setHeader('Content-Type', register.contentType);
        res.end(await register.metrics());
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });

    return new Promise((resolve) => {
      server.listen(Number.parseInt(port), () => {
        resolve(server);
      });
    });
  }
}
