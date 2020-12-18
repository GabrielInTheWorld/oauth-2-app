import { Application, NextFunction, Request, Response } from 'express';
import { getSecureUrl } from 'src/express/routes/Routes';

export class UsersRoutes {
  private readonly app: Application;

  public constructor(app: Application) {
    this.app = app;
  }

  public init(): void {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.app.post(getSecureUrl('/users/get-all'));
    this.app.post(getSecureUrl('/users/get'));
    this.app.post(getSecureUrl('/users/create'));
    this.app.post(getSecureUrl('/users/update'));
    this.app.post(getSecureUrl('/users/delete'));
  }
}
