import { Application, NextFunction, Request, Response } from 'express';

export class SettingsRoutes {
  private readonly app: Application;

  public constructor(app: Application) {
    this.app = app;
  }

  public init(): void {
    this.initRoutes();
  }

  private initRoutes(): void {}
}
