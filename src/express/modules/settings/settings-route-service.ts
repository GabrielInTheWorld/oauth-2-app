import { Request, Response } from 'express';

import { Inject } from '../../../application/model-layer/core/modules/decorators';
import { Logger } from './../../../application/services/logger';
import { Middleware } from '../../base/middleware';
import { SettingsHandler } from '../../../application/interfaces/settings-handler';
import { SettingsService } from '../../../application/services/settings-service';
import { Token } from './../../../application/model-layer/core/models/ticket/token';

export class SettingsRouteService extends Middleware {
  @Inject(SettingsService)
  private readonly settingsHandler: SettingsHandler;

  public async setAuthentication(req: Request, res: Response): Promise<void> {
    try {
      const accessToken = res.locals['token'] as Token;
      const authenticationTypes = req.body['authenticationTypes'];
      const initialValues = req.body['values'];
      const answer = await this.settingsHandler.setAuthenticationMethod(
        accessToken.userId,
        authenticationTypes,
        initialValues
      );
      return this.sendResponse(true, 'successful', res, 200, answer);
    } catch (e) {
      Logger.error(e);
      this.sendResponse(false, e, res, 401);
    }
  }

  public async setAuthenticationOfOthers(req: Request, res: Response): Promise<void> {
    try {
      await this.settingsHandler.setAuthenticationMethodOfOthers(req.body['defaultAuthenticationTypes']);
      this.sendResponse(true, 'successful', res);
    } catch (e) {
      Logger.error(e);
      this.sendResponse(false, e, res, 401);
    }
  }

  public async confirmTotp(req: Request, res: Response): Promise<void> {
    try {
      const token = res.locals['token'] as Token;
      const totp = req.body['totp'];
      this.settingsHandler.confirmTotp(`${token.userId}`, totp);
      this.sendResponse(true, 'successful', res);
    } catch (e) {
      Logger.error(e);
      this.sendResponse(false, e, res, 401);
    }
  }
}
