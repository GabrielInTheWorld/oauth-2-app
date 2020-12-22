import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { AuthenticationTypes } from '../../../model-layer/user/authentication-types';
import { BaseAuthenticator } from './base-authenticator';
import { MissingAuthenticationException } from '../../../model-layer/core/exceptions/missing-authentication-exception';
import { User } from './../../../model-layer/core/models/user';

export class EmailAuthenticator extends BaseAuthenticator {
  public checkAuthenticationType(user: User, value?: string): void {
    if (!value) {
      this.intervals.set(
        user.userId,
        setInterval(() => this.prepareEmailAuthentication(user), 30)
      );
      throw new MissingAuthenticationException(AuthenticationTypes.EMAIL, user);
    }
    const pendingUser = this.currentlyPendingUsers.get(user.userId);
    if (pendingUser?.authenticationCredentials.email !== value) {
      throw new AuthenticationException('Email code is not provided!');
    }
  }

  private prepareEmailAuthentication(user: User): void {
    const hotp = this.hashingHandler.hotp(user.emailSecret as string);
    user.authenticationCredentials.email = hotp;
    this.registerPendingUser(user);
    this.sendEmailWithHotp(user.email as string, hotp);
  }

  private sendEmailWithHotp(email: string, hotp: string): void {}
}
