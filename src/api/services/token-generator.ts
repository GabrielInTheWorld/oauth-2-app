import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { uuid } from 'uuidv4';
import cryptoRandomString from 'crypto-random-string';

import User from '../../core/models/user/user';
import UserService from '../../core/models/user/user-service';
import { UserServiceInterface } from '../../core/models/user/user-service.interface';
import { Keys } from '../../config';
import { Constructable, Inject, InjectService } from '../../core/modules/decorators';
import { Cookie, Generator, Response } from '../interfaces/generator';

@Constructable(Generator)
export default class TokenGenerator implements Generator {
  public name = 'TokenGenerator';

  public async createTicket(user: User): Promise<Response> {
    if (!Object.keys(user).length) {
      throw new Error('user is empty.');
    }
    const sessionId = cryptoRandomString({ length: 32 });
    user.setSession(sessionId);
    const cookie = this.generateCookie(sessionId);
    const token = this.generateToken(sessionId, user);
    return { cookie, token, user };
  }

  public async renewTicket(cookie: string, sessionId: string, user: User): Promise<Response> {
    try {
      const refreshId = this.verifyCookie(cookie);
      const token = this.generateToken(refreshId.sessionId, user);
      return { token, cookie, user };
    } catch {
      throw new Error('Cookie has wrong format.');
    }
  }

  public verifyCookie(cookieAsString: string): Cookie {
    return jwt.verify(cookieAsString, Keys.privateCookieKey()) as Cookie;
  }

  private generateToken(sessionId: string, client: User): string {
    const token = jwt.sign(
      { username: client.username, expiresIn: '10m', sessionId, clientId: client.clientId },
      Keys.privateKey(),
      {
        expiresIn: '10m'
      }
    );
    return token;
  }

  private generateCookie(sessionId: string): string {
    const cookie = jwt.sign({ sessionId }, Keys.privateCookieKey(), { expiresIn: '1d' });
    return cookie;
  }
}
