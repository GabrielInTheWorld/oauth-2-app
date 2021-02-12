import { AuthenticationException } from './../model-layer/core/exceptions/authentication-exception';
import { PasswordAuthenticator } from './../util/authentication/implementations/password-authenticator';
import { TotpAuthenticator } from './../util/authentication/implementations/totp-authenticator';
import { EmailAuthenticator } from './../util/authentication/implementations/email-authenticator';
import { BiometricsAuthenticator } from './../util/authentication/implementations/biometrics-authenticator';
import { AuthenticatorProvider } from '../interfaces/authenticator-provider';
import { User } from '../model-layer/core/models/user';
import { AuthenticationCredential } from '../model-layer/user/authentication-credential';
import { AuthenticationType } from '../model-layer/user/authentication-types';
import { Authenticator } from '../util/authentication/interfaces/authenticator';

export class AuthenticatorProviderService implements AuthenticatorProvider {
  private readonly authenticators: { [key in AuthenticationType]?: Authenticator } = {
    password: new PasswordAuthenticator(),
    totp: new TotpAuthenticator(),
    email: new EmailAuthenticator(),
    biometrics: new BiometricsAuthenticator()
  };

  public readAuthenticationValues(user: User, values: AuthenticationCredential): void {
    if (!Object.keys(this.authenticators).length) {
      throw new AuthenticationException('No authenticators provided!');
    }
    for (const key of user.authenticationTypes) {
      if (!this.authenticators[key]) {
        throw new AuthenticationException(`Authenticator ${key} not provided!`);
      }
      this.authenticators[key]?.checkAuthenticationType(user, values[key]);
    }
  }

  public writeAuthenticationValues(
    user: User,
    types: AuthenticationType[],
    initValues: AuthenticationCredential
  ): User {
    if (!Object.keys(this.authenticators).length) {
      throw new AuthenticationException('No authenticators provided!');
    }
    for (const key of types) {
      if (!this.authenticators[key]) {
        throw new AuthenticationException(`Authenticator ${key} not provided!`);
      }
      console.log('user[key]');
      user = this.authenticators[key]?.writeAuthenticationType(user, initValues[key]);
    }
    return user;
  }

  public getAvailableAuthenticationTypes(): AuthenticationType[] {
    return Object.keys(this.authenticators) as AuthenticationType[];
  }

  public getTotpValidator(): TotpAuthenticator {
    return this.authenticators.totp as TotpAuthenticator;
  }
}
