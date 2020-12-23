import { Authentication } from '../util/authentication/authentication';
import { AuthenticationCredential } from '../model-layer/user/authentication-credential';
import { AuthenticationException } from './../model-layer/core/exceptions/authentication-exception';
import { AuthenticationType } from '../model-layer/user/authentication-types';
import { AuthenticatorProvider } from '../interfaces/authenticator-provider';
import { AuthenticatorProviderService } from './authenticator-provider-service';
import { Constructable, Inject } from '../model-layer/core/modules/decorators';
import { Logger } from './logger';
import { SettingsHandler, SettingsObject } from '../interfaces/settings-handler';
import { UserHandler } from '../model-layer/user/user-handler';
import { UserService } from '../model-layer/user/user-service';

@Constructable(SettingsHandler)
export class SettingsService extends SettingsHandler {
  @Inject(UserService)
  private readonly userHandler: UserHandler;

  @Inject(AuthenticatorProviderService)
  private readonly provider: AuthenticatorProvider;

  private readonly defaultSettings: SettingsObject = {
    defaultAuthenticationMethod: AuthenticationType.PASSWORD
  };

  public setSetting(key: keyof SettingsObject | string, value: any): void {
    this.defaultSettings[key] = value;
  }

  public getSetting(key: keyof SettingsObject | string): any {
    return this.defaultSettings[key];
  }

  public getDefaultSettings(): SettingsObject {
    return this.defaultSettings;
  }

  public async setAuthenticationMethod(
    userId: number,
    types: AuthenticationType[],
    initValues: AuthenticationCredential
  ): Promise<Authentication.InitialValues> {
    if (!types.length) {
      throw new AuthenticationException('At least one authentication method has to be provided.');
    }
    if (!initValues) {
      throw new AuthenticationException('Any initial values has to be given!');
    }
    Logger.debug('AuthenticationTypes:', types);
    Logger.debug('InitialValues', initValues);
    let user = await this.userHandler.getUserByUserId(`${userId}`);
    user.authenticationTypes = types;
    user = this.provider.writeAuthenticationValues(user, types, initValues);
    Logger.debug('New user:', user);
    await this.userHandler.update(user.userId, user);
    // const totp = this.provider.getTotpValidator();
    // totp.checkAuthenticationType(user);
    const answer: Authentication.InitialValues = {};
    if (types.includes(AuthenticationType.TOTP)) {
      answer.totpUri = Authentication.otpToUri({
        type: 'totp',
        to: user.username,
        issuer: 'OpenSlides',
        secret: user.totpSecret as string,
        period: 30,
        digits: 6
      });
    }
    if (types.includes(AuthenticationType.EMAIL)) {
      answer.emailSecret = user.emailSecret;
    }
    if (types.includes(AuthenticationType.PASSWORD)) {
      answer.password = user.password;
    }
    if (types.includes(AuthenticationType.BIOMETRICS)) {
      answer.biometrics = user.biometrics;
    }
    return answer;
  }

  public setAuthenticationMethodOfOthers(types: AuthenticationType[]): Promise<void> {
    return this.userHandler.setDefaultAuthenticationTypes(types);
  }

  public async confirmTotp(userId: string, code: string): Promise<void> {
    const user = await this.userHandler.getUserByUserId(userId);
    const totp = this.provider.getTotpValidator();
    totp.checkAuthenticationType(user, code);
  }
}
