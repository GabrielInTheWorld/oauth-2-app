import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { uuid } from 'uuidv4';

import User from '../../core/models/user/user';
import UserService from '../../core/models/user/user-service';
import { UserServiceInterface } from '../../core/models/user/user-service.interface';
import { Keys } from '../../config';
import { Constructable, Inject, InjectService } from '../../core/modules/decorators';
import { Cookie, Generator, Response } from '../interfaces/generator';

@Constructable(Generator)
export default class TokenGenerator implements Generator {
  public name = 'TokenGenerator';

  @InjectService(UserService)
  private readonly userService: UserService;

  public async createTicket(username: string, password: string): Promise<Response> {
    const user = await this.userService.getUserByCredentials(username, password);
    if (user) {
      const sessionId = uuid();
      const cookie = jwt.sign({ sessionId }, Keys.privateCookieKey(), { expiresIn: '1d' });
      user.setSession(sessionId);
      const token = `Bearer ${this.generateToken(sessionId, user)}`;
      return { cookie, token, client: user };
    } else {
      throw new Error('User is not defined.');
    }
  }

  public async renewTicket(cookieAsString: string): Promise<Response> {
    try {
      const refreshId = this.verifyCookie(cookieAsString);
      const client = (await this.userService.getUserBySessionId(refreshId.sessionId)) || ({} as User);
      const token = this.generateToken(refreshId.sessionId, client);
      return { token, cookie: cookieAsString, client };
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
