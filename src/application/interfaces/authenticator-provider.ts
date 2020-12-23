import { TotpAuthenticator } from './../util/authentication/implementations/totp-authenticator';
import { AuthenticationType } from './../model-layer/user/authentication-types';
import { User } from './../model-layer/core/models/user';
import { AuthenticationCredential } from '../model-layer/user/authentication-credential';

export abstract class AuthenticatorProvider {
  public abstract readAuthenticationValues(user: User, types: AuthenticationCredential): void;
  public abstract writeAuthenticationValues(
    user: User,
    types: AuthenticationType[],
    initValues: AuthenticationCredential
  ): User;

  public abstract getTotpValidator(): TotpAuthenticator;
}
