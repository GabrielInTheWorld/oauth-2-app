import 'reflect-metadata';

import AuthenticationServer from './api/server/authentication-server';
import BaseServer from './api/interfaces/base-server';
import { Inject } from './core/modules/decorators';

class Server {
  private readonly PORT: number = parseInt(process.env.PORT || '', 10) || 8000;

  public get port(): number {
    return this.PORT;
  }

  @Inject(BaseServer)
  private readonly httpServer: AuthenticationServer;

  public start(): void {
    this.httpServer.getServer().listen(this.PORT, () => {
      console.log(`Server is running on port ${this.PORT}`);
    });
  }
}

const server = new Server();
server.start();
