import { Application, NextFunction, Request, Response } from 'express';

import { Inject } from '../../../application/model-layer/core/modules/decorators';
import { Middleware } from '../../base/middleware';
import { getSecureUrl } from '../../routes/Routes';
import { UserHandler } from '../../../application/model-layer/user/user-handler';
import { UserService } from '../../../application/model-layer/user/user-service';

export class UsersRoutes extends Middleware {
  @Inject(UserService)
  private readonly userHandler: UserHandler;

  private readonly app: Application;

  public constructor(app: Application) {
    super();
    this.app = app;
  }

  public init(): void {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.app.post(getSecureUrl('/users/get-all'), (_, res) => this.getAllUsers(res));
    this.app.post(getSecureUrl('/users/get'));
    this.app.post(getSecureUrl('/users/create'));
    this.app.post(getSecureUrl('/users/update'));
    this.app.post(getSecureUrl('/users/delete'));
  }

  private async getAllUsers(res: Response): Promise<void> {
    const users = await this.userHandler.getAllUsers();
    return this.sendResponse(true, 'Successful', res, 200, { users });
  }
}
