import base32Encode from 'base32-encode';

import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { AuthenticationType } from './../../../model-layer/user/authentication-types';
import { BaseAuthenticator } from './base-authenticator';
import { Logger } from './../../../services/logger';
import { MissingAuthenticationException } from '../../../model-layer/core/exceptions/missing-authentication-exception';
import { User } from './../../../model-layer/core/models/user';

export class TotpAuthenticator extends BaseAuthenticator {
  public checkAuthenticationType(user: User, value?: string): void {
    if (!value) {
      this.prepareTotpAuthentication(user);
      this.intervals.set(
        user.userId,
        setInterval(() => this.prepareTotpAuthentication(user), 30000)
      );
      throw new MissingAuthenticationException(AuthenticationType.TOTP, user);
    }
    const pendingUser = this.currentlyPendingUsers.get(user.userId);
    if (pendingUser?.authenticationCredentials.totp !== value) {
      throw new AuthenticationException('TOTP codes do not match!');
    }
    this.doCleanUp(user.userId);
  }

  public writeAuthenticationType(user: User): User {
    if (user.totpSecret && user.totpT0) {
      return user;
    }
    const arrayBuffer = new TextEncoder().encode('Hello World');
    const secret = base32Encode(arrayBuffer, 'RFC3548', { padding: false });
    const updatedUser = new User({ ...user, totpSecret: secret, totpT0: Math.round(new Date().getTime() / 1000) });
    return updatedUser;
  }

  private prepareTotpAuthentication(user: User): void {
    const totp = this.hashingHandler.totp(user.totpSecret as string, user.totpT0 as number);
    Logger.debug('Totp:', totp);
    user.authenticationCredentials.totp = totp;
    this.registerPendingUser(user);
  }
}
