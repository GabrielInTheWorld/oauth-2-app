import 'reflect-metadata';
import { WebsocketHandler } from 'reactive-websocket';

import AuthenticationServer from './express/server/authentication-server';
import { BaseServer } from './express/interfaces/base-server';
import { Factory, Inject } from './application/model-layer/core/modules/decorators';
import { Logger } from './application/services/logger';

export class Application {
  public static readonly PORT: number = parseInt(process.env.PORT || '', 10) || 8000;

  public get port(): number {
    return Application.PORT;
  }

  @Factory(AuthenticationServer, { port: Application.PORT })
  private readonly httpServer: BaseServer;

  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  public start(): void {
    const server = this.httpServer.getServer().listen(Application.PORT, () => {
      Logger.log(`Server is running on port ${Application.PORT}`);
    });
    this.websocket.initWebsocket({
      httpServer: server
    });
  }
}

const app = new Application();
app.start();
