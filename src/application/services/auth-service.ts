import { AuthenticatorProviderService } from './authenticator-provider-service';
import { AuthHandler } from '../interfaces/auth-handler';
import { AuthenticationCredential } from './../model-layer/user/authentication-credential';
import { AuthenticationException } from '../model-layer/core/exceptions/authentication-exception';
import { AuthenticationType } from './../model-layer/user/authentication-types';
import { Authenticator } from './../util/authentication/interfaces/authenticator';
import { BiometricsAuthenticator } from './../util/authentication/implementations/biometrics-authenticator';
import { Factory, Inject } from '../model-layer/core/modules/decorators';
import { EmailAuthenticator } from './../util/authentication/implementations/email-authenticator';
import { HashingHandler } from '../interfaces/hashing-handler';
import { HashingService } from './hashing-service';
import { Logger } from './logger';
import { PasswordAuthenticator } from './../util/authentication/implementations/password-authenticator';
import { SessionService } from './session-service';
import { Ticket, Token } from '../model-layer/core/models/ticket';
import { TicketHandler } from '../interfaces/ticket-handler';
import { TicketService } from './ticket-service';
import { TotpAuthenticator } from './../util/authentication/implementations/totp-authenticator';
import { UserHandler } from '../model-layer/user/user-handler';
import { UserService } from '../model-layer/user/user-service';
import { Validation } from '../interfaces/validation';
import { AuthenticatorProvider } from '../interfaces/authenticator-provider';

export class AuthService implements AuthHandler {
  @Inject(UserService)
  private readonly userHandler: UserHandler;

  @Factory(TicketService)
  private readonly ticketHandler: TicketHandler;

  @Factory(HashingService)
  private readonly hashHandler: HashingHandler;

  @Inject(SessionService)
  private readonly sessionHandler: SessionService;

  @Inject(AuthenticatorProviderService)
  private readonly provider: AuthenticatorProvider;

  // private readonly authenticators: { [key in AuthenticationType]?: Authenticator } = {
  //   password: new PasswordAuthenticator(),
  //   totp: new TotpAuthenticator(),
  //   email: new EmailAuthenticator(),
  //   biometrics: new BiometricsAuthenticator()
  // };

  public async login(username: string, password?: string): Promise<Validation<Ticket>> {
    try {
      const user = await this.userHandler.getUserByUsername(username);
      // this.checkAuthenticationTypes(user, { password });
      this.provider.readAuthenticationValues(user, { password });
      return await this.ticketHandler.create(user);
    } catch (e) {
      Logger.error(e);
      return { isValid: false, message: e.message };
    }
  }

  public async whoAmI(cookieAsString: string): Promise<Validation<Ticket>> {
    Logger.debug(`whoAmI -- cookie: ${cookieAsString}`);
    const answer = await this.ticketHandler.refresh(cookieAsString);
    return answer;
  }

  public logout(token: Token): void {
    this.sessionHandler.clearSessionById(token.sessionId);
  }

  public async getListOfSessions(): Promise<string[]> {
    return await this.sessionHandler.getAllActiveSessions();
  }

  public async clearUserSessionById(sessionId: string): Promise<Validation<void>> {
    await this.sessionHandler.clearSessionById(sessionId);
    return { isValid: true, message: 'successful' };
  }

  public async clearAllSessionsExceptThemselves(sessionId: string): Promise<Validation<void>> {
    await this.sessionHandler.clearAllSessionsExceptThemselves(sessionId);
    return { isValid: true, message: 'successful' };
  }

  public toHash(input: string): string {
    return this.hashHandler.hash(input);
  }

  public isEquals(toHash: string, toCompare: string): boolean {
    return this.hashHandler.isEquals(toHash, toCompare);
  }

  // public registerAuthenticator(type: AuthenticationType, value: Authenticator): void {
  //   this.authenticators[type] = value;
  // }

  public async reset(): Promise<void> {
    await this.userHandler.reset();
  }

  // private checkAuthenticationTypes(user: User, values: AuthenticationCredential): void {
  //   if (!Object.keys(this.authenticators).length) {
  //     throw new AuthenticationException('No authenticators provided!');
  //   }
  //   for (const key of user.authenticationTypes) {
  //     if (!this.authenticators[key]) {
  //       throw new AuthenticationException(`Authenticator ${key} not provided!`);
  //     }
  //     this.authenticators[key]?.checkAuthenticationType(user, values[key]);
  //   }
  // }
}
