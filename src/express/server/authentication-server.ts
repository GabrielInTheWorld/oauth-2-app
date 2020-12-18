import cookieParser from 'cookie-parser';
import express from 'express';
import { createServer, Server } from 'http';
import path from 'path';

import { BaseServer } from '../interfaces/base-server';
import { Constructable } from '../../application/model-layer/core/modules/decorators';
import { OAuthRoutes } from '../modules/oauth/oauth-routes';
import { RouteHandler } from '../../express/interfaces/route-handler';
import { Routes } from '../routes/Routes';
import { UsersRoutes } from './../modules/users/users-routes';

@Constructable(BaseServer)
export default class AuthenticationServer extends BaseServer {
  public static readonly ALLOWED_ORIGINS = [
    'http://localhost:8000',
    'http://localhost:4200',
    'http://localhost:4210',
    'http://localhost:8010'
  ];

  public name = 'AuthenticationServer';

  private app: express.Application;
  private server: Server;
  private routes: Routes;
  private oauthRoutes: OAuthRoutes;
  private userRoutes: UsersRoutes;

  private readonly CLIENT_PATH = 'client/dist/client';

  private readonly port: number;

  public constructor(input: { port: number }) {
    super();
    this.port = input.port;
    this.createApp();
    this.createServer();
    this.initializeConfig();
    this.initializeRoutes();
    this.initClient();
  }
  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): Server {
    return this.server;
  }

  private createApp(): void {
    this.app = express();
  }

  private createServer(): void {
    this.server = createServer(this.app);
  }

  private initializeConfig(): void {
    this.app.use((req, res, next) => this.corsFunction(req, res, next));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(cookieParser());
  }

  private initializeRoutes(): void {
    this.routes = new Routes(this.app);
    this.routes.initRoutes();
    this.oauthRoutes = new OAuthRoutes(this.app);
    this.oauthRoutes.initRoutes();
    this.userRoutes = new UsersRoutes(this.app);
    this.userRoutes.init();
  }

  private initClient(): void {
    this.app.use('/', express.static(path.resolve(this.CLIENT_PATH)));
    this.app.use('/', express.static(path.resolve(RouteHandler.VIEWS_PATH)));
    this.app.set('views', path.resolve(RouteHandler.VIEWS_PATH));
    this.app.set('view engine', 'jsx');
    this.app.engine('jsx', require('express-react-views').createEngine());
  }

  private corsFunction(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const origin = req.headers.origin;
    const requestingOrigin = Array.isArray(origin) ? origin.join(' ') : origin || '';
    if (AuthenticationServer.ALLOWED_ORIGINS.indexOf(requestingOrigin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', requestingOrigin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, DELETE, PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, X-Content-Type, Authentication, Authorization, X-Access-Token, Accept'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return next();
  }
}
