import express, { Request, Response } from 'express';

import { AuthHandler } from '../../application/interfaces/auth-handler';
import { AuthService } from '../../application/services/auth-service';
import { Factory } from '../../application/model-layer/core/modules/decorators';
import { Logger } from '../../application/services/logger';
import { RouteHandler } from '../interfaces/route-handler';
import { Token } from '../../application/model-layer/core/models/ticket';

export default class RouteService extends RouteHandler {
  @Factory(AuthService)
  private readonly authHandler: AuthHandler;

  public async login(request: express.Request, response: express.Response): Promise<void> {
    const username = request.body.username;
    const password = request.body.password;
    Logger.log(`user: ${username} -- signs in`);

    const result = await this.authHandler.login(username, password);
    if (!result.result) {
      this.sendResponse(false, result.message, response, 403, undefined, result.reason);
      return;
    }

    response.locals['newToken'] = result.result.token;
    response.locals['newCookie'] = result.result.cookie;
    this.sendResponse(true, 'Authentication successful!', response);
  }
  public async login2(request: express.Request, response: express.Response): Promise<void> {
    const username = request.body.username;
    Logger.log(`user: ${username} -- signs in`);

    const result = await this.authHandler.confirmAdditionalCredentials(username, { ...request.body });
    if (!result.result) {
      this.sendResponse(false, result.message, response, 403, undefined, result.reason);
      return;
    }

    response.locals['newToken'] = result.result.token;
    response.locals['newCookie'] = result.result.cookie;
    this.sendResponse(true, 'Authentication successful!', response);
  }

  public async whoAmI(request: express.Request, response: express.Response): Promise<void> {
    const cookieAsString = request.cookies[AuthHandler.COOKIE_NAME];
    const result = await this.authHandler.whoAmI(cookieAsString);
    if (!result.isValid || (result.isValid && !result.result)) {
      response.clearCookie(AuthHandler.COOKIE_NAME);
      this.sendResponse(true, 'anonymous', response);
      return;
    }
    response.locals['newToken'] = result.result?.token;
    this.sendResponse(true, 'Authentication successful!', response);
  }

  public logout(request: express.Request, response: express.Response): void {
    const token = response.locals['token'] as Token;
    try {
      this.authHandler.logout(token);
      response.clearCookie(AuthHandler.COOKIE_NAME);
      this.sendResponse(true, 'Successfully signed out!', response);
    } catch (e) {
      this.sendResponse(false, e, response, 403);
    }
  }

  public async getListOfSessions(request: express.Request, response: express.Response): Promise<void> {
    this.sendResponse(true, 'Successful', response, 200, {
      sessions: await this.authHandler.getListOfSessions()
    });
  }

  public clearUserSessionById(request: express.Request, response: express.Response): void {
    const userId = request.body['sessionId'];
    try {
      this.authHandler.clearUserSessionById(userId);
      this.sendResponse(true, 'Cleared!', response);
    } catch (e) {
      this.sendResponse(false, e, response, 403);
    }
  }

  public clearAllSessionsExceptThemselves(request: express.Request, response: express.Response): void {
    const token = response.locals['token'] as Token;
    try {
      this.authHandler.clearAllSessionsExceptThemselves(token.sessionId);
      this.sendResponse(true, 'Cleared!', response);
    } catch (e) {
      this.sendResponse(false, e, response, 403);
    }
  }

  public hash(request: express.Request, response: express.Response): void {
    const toHash = request.body['toHash'];
    this.sendResponse(true, 'Successful', response, 200, { hash: this.authHandler.toHash(toHash) });
  }

  public isEquals(request: express.Request, response: express.Response): void {
    const toHash = request.body['toHash'];
    const toCompare = request.body['toCompare'];
    this.sendResponse(true, 'Successful', response, 200, {
      isEquals: this.authHandler.isEquals(toHash, toCompare)
    });
  }

  public async notFound(request: Request, response: Response): Promise<void> {
    this.sendResponse(false, 'Your requested resource is not found...', response, 404);
  }

  public index(_: any, response: Response): void {
    this.sendResponse(true, 'Authentication service is available', response);
  }

  public secureIndex(_: any, response: Response): void {
    this.sendResponse(true, 'Yeah! An api resource!', response);
  }

  public authenticate(_: any, response: Response): void {
    const token = response.locals['token'] as Token;
    this.sendResponse(true, 'Successful', response, 200, {
      userId: token.userId,
      sessionId: token.sessionId
    });
  }

  public reset(req: Request, response: Response): void {
    this.authHandler.reset().then(() => this.sendResponse(true, 'successful', response));
  }
}
