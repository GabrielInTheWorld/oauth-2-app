import { NextFunction, Request, Response } from 'express';

import Client from '../../core/models/user/user';
import { InjectableClass } from '../../core/modules/decorators';

export default class SessionHandlerInterface extends InjectableClass {
  public validateSession: (request: Request, response: Response, next: NextFunction) => Response | void;
  public getAllActiveSessions: () => string[];
  public clearSessionById: (sessionId: string) => boolean;
  public clearAllSessionsExceptThemselves: (exceptSessionId: string) => boolean;
  public hasSession: (sessionId: string) => boolean;
  public addSession: (client: Client) => boolean;
}
