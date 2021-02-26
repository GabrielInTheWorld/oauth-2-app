import { Response } from 'express';

import { AuthHandler } from '../../application/interfaces/auth-handler';
import { HttpData } from '../../application/services/http-service';
import { Logger } from '../../application/services/logger';

export abstract class Middleware {
  protected sendResponse(
    success: boolean,
    message: string,
    response: Response,
    code: number = 200,
    data: HttpData = {},
    reason?: string,
    onlyData: boolean = false
  ): void {
    if (response.locals['newToken']) {
      Logger.debug('Set a new token: ', response.locals['newToken']);
      response.setHeader('Authentication', response.locals['newToken']);
      response.setHeader('Access-Control-Expose-Headers', 'authentication, Authentication');
    }
    if (response.locals['newCookie']) {
      Logger.debug('Set a new refresh-id: ', response.locals['newCookie']);
      response.cookie(AuthHandler.COOKIE_NAME, response.locals['newCookie'], {
        secure: false,
        httpOnly: true
      });
    }
    Logger.debug(`Successful: ${code} ${success} --- Message: ${message}`);
    Logger.debug(`Send data:`, data);
    if (onlyData) {
      response.status(code).json(data);
    } else {
      response.status(code).send({
        success,
        message,
        reason,
        ...data
      });
    }
  }
}
