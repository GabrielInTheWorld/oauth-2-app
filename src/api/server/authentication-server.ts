import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createServer, Server } from 'http';
import path from 'path';

import BaseServer from '../interfaces/base-server';
import { Constructable } from '../../core/modules/decorators';
import { OAuthRoutes } from '../oauth/oauth-routes';
import Routes from '../routes/Routes';

@Constructable(BaseServer)
export default class AuthenticationServer implements BaseServer {
  public name = 'AuthenticationServer';

  private app: express.Application;
  private server: Server;
  private routes: Routes;
  private oauthRoutes: OAuthRoutes;

  private readonly CLIENT_PATH = 'client/dist/client';

  public constructor() {
    this.createApp();
    this.createServer();
    this.initializeConfig();
    this.initializeRoutes();
    this.initClient();
  }

  private createApp(): void {
    this.app = express();
  }

  private createServer(): void {
    this.server = createServer(this.app);
  }

  private initializeConfig(): void {
    // this.app.use(
    //   cors({
    //     allowedHeaders:
    //       'Origin, X-Requested-With, Content-Type, X-Content-Type, Authentication, Authorization, X-Access-Token, Accept',
    //     credentials: false,
    //     origin: '*',
    //     methods: 'OPTIONS, GET, POST, PUT, DELETE'
    //   })
    // );
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(cookieParser());
  }

  private initializeRoutes(): void {
    this.routes = new Routes(this.app);
    this.routes.initRoutes();
    this.oauthRoutes = new OAuthRoutes(this.app);
    this.oauthRoutes.initRoutes();
  }

  private initClient(): void {
    this.app.use('/', express.static(path.resolve(this.CLIENT_PATH)));
    // const index = path.join(path.resolve(this.CLIENT_PATH), 'index.html');
    // this.app.get('*', (_, res) => {
    //     res.sendFile(index);
    // });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): Server {
    return this.server;
  }
}
