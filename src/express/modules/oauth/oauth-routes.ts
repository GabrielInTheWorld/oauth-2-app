import express from 'express';

import { Factory } from '../../../application/model-layer/core/modules/decorators';
import { OAuthHandler } from './oauth-handler';
import { OAuthService } from './oauth-service';
import { TicketValidator } from '../../../express/middleware/ticket-validator';
import { Validator } from '../../../express/interfaces/validator';

export class OAuthRoutes {
  private readonly SECURE_API_PREFIX = '/oauth';
  private readonly app: express.Application;

  @Factory(OAuthService)
  private readonly oauthHandler: OAuthHandler;

  @Factory(TicketValidator)
  private readonly oauthValidator: Validator;

  public constructor(app: express.Application) {
    this.app = app;
  }

  public initRoutes(): void {
    this.configApiRoutes();
    this.initPublicRoutes();
    this.initOAuthRoutes();
  }

  private configApiRoutes(): void {
    this.app.all(`${this.SECURE_API_PREFIX}/*`, (req, res, next) => {
      console.log('configOAuth', req.headers);
      this.oauthValidator.validate(req, res, next);
    });
  }

  private initPublicRoutes(): void {
    this.app.post('/token', (request, response) => this.oauthHandler.generateToken(request, response));
    this.app.get('/authorize', (request, response) => this.oauthHandler.authorize(request, response));
    this.app.post('/approve', (request, response) => this.oauthHandler.approve(request, response));
  }

  private initOAuthRoutes(): void {
    this.app.get(this.getOAuthRoute('/greet'), (request, response) => this.oauthHandler.greeting(request, response));
  }

  private getOAuthRoute(urlPath: string): string {
    return `${this.SECURE_API_PREFIX}${urlPath}`;
  }
}
