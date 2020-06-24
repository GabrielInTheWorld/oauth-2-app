import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { uuid } from 'uuidv4';

import User from '../../core/models/user/user';
import UserService from '../../core/models/user/user-service';
import { UserServiceInterface } from '../../core/models/user/user-service.interface';
import { Keys } from '../../config';
import { Constructable, Inject } from '../../core/modules/decorators';
import { Cookie, Generator, Response } from '../interfaces/generator';

@Constructable(Generator)
export default class TokenGenerator implements Generator {
  public name = 'TokenGenerator';

  @Inject(UserServiceInterface)
  private readonly clientService: UserService;

  public constructor() {
    this.init();
  }

  public async createTicket(username: string, password: string): Promise<Response> {
    const client = await this.clientService.getUserByCredentials(username, password);
    if (client) {
      const sessionId = uuid();
      const cookie = jwt.sign({ sessionId }, Keys.privateCookieKey(), { expiresIn: '1d' });
      client.setSession(sessionId);
      const token = this.generateToken(sessionId, client);
      return { cookie, token, client };
    } else {
      throw new Error('Client is not defined.');
    }
  }

  public async renewTicket(cookieAsString: string): Promise<Response> {
    try {
      const refreshId = this.verifyCookie(cookieAsString);
      const client = (await this.clientService.getUserBySessionId(refreshId.sessionId)) || ({} as User);
      const token = this.generateToken(refreshId.sessionId, client);
      return { token, cookie: cookieAsString, client };
    } catch {
      throw new Error('Cookie has wrong format.');
    }
  }

  public verifyCookie(cookieAsString: string): Cookie {
    return jwt.verify(cookieAsString, Keys.privateCookieKey()) as Cookie;
  }

  private init(): void {
    this.insertMockData();
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

  private async insertMockData(): Promise<void> {
    if (this.clientService) {
      await this.clientService.create('admin', 'admin');
      await this.clientService.getUserByCredentials('admin', 'admin');
    }
  }
}
