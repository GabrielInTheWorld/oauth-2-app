import User from '../../core/models/user/user';
import { InjectableClass } from '../../core/modules/decorators';

export interface Token {
  expiresAt: Date;
  userId: number;
  sessionId: string;
  issuer: string;
  payload: {};
  signature: string;
}

export interface Cookie {
  sessionId: string;
  signature: string;
}

export interface Response {
  cookie: string;
  token: string;
  user: User;
}

export class Generator extends InjectableClass {
  public createTicket: (user: User) => Promise<Response>;
  public renewTicket: (cookie: string, sessionId: string, user: User) => Promise<Response>;
  public verifyCookie: (cookie: string) => Cookie;
}
