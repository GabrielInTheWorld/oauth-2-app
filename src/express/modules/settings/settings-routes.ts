import { Application, NextFunction, Request, Response } from 'express';

import { Inject } from '../../../application/model-layer/core/modules/decorators';
import { getSecureUrl } from '../../routes/Routes';
import { SettingsRouteService } from './settings-route-service';

export class SettingsRoutes {
  @Inject(SettingsRouteService)
  private readonly routeService: SettingsRouteService;

  private readonly app: Application;

  public constructor(app: Application) {
    this.app = app;
  }

  public init(): void {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.app.post(getSecureUrl('/settings/set-authentication'), (req, res) =>
      this.routeService.setAuthentication(req, res)
    );
    this.app.post(getSecureUrl('/settings/set-authentication-of-others'), (req, res) => {});
  }
}
