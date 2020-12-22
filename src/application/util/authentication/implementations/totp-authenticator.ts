import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { AuthenticationTypes } from './../../../model-layer/user/authentication-types';
import { BaseAuthenticator } from './base-authenticator';
import { MissingAuthenticationException } from '../../../model-layer/core/exceptions/missing-authentication-exception';
import { User } from './../../../model-layer/core/models/user';

export class TotpAuthenticator extends BaseAuthenticator {
  public checkAuthenticationType(user: User, value?: string): void {
    if (!value) {
      this.intervals.set(
        user.userId,
        setInterval(() => this.prepareTotpAuthentication(user), 30)
      );
      throw new MissingAuthenticationException(AuthenticationTypes.TOTP, user);
    }
    const pendingUser = this.currentlyPendingUsers.get(user.userId);
    if (pendingUser?.authenticationCredentials.totp !== value) {
      throw new AuthenticationException('TOTP codes do not match!');
    }
    this.doCleanUp(user.userId);
  }

  private prepareTotpAuthentication(user: User): void {
    const totp = this.hashingHandler.totp(user.totpSecret as string, user.totpT0);
    user.authenticationCredentials.totp = totp;
    this.registerPendingUser(user);
  }
}
