import 'reflect-metadata';

import AuthenticationServer from './express/server/authentication-server';
import { BaseServer } from './express/interfaces/base-server';
import { Factory } from './application/model-layer/core/modules/decorators';
import { Logger } from './application/services/logger';

export class Server {
  public static readonly PORT: number = parseInt(process.env.PORT || '', 10) || 8000;

  public get port(): number {
    return Server.PORT;
  }

  @Factory(AuthenticationServer, { port: Server.PORT })
  private readonly httpServer: BaseServer;

  public start(): void {
    this.httpServer.getServer().listen(Server.PORT, () => {
      Logger.log(`Server is running on port ${Server.PORT}`);
    });
  }
}

const server = new Server();
server.start();
