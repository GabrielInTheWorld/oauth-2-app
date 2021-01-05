import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { AuthenticationType } from '../../../model-layer/user/authentication-types';
import { BaseAuthenticator } from './base-authenticator';
import { MissingAuthenticationException } from '../../../model-layer/core/exceptions/missing-authentication-exception';
import { User } from './../../../model-layer/core/models/user';
import { Random } from '../../helper';

export class EmailAuthenticator extends BaseAuthenticator {
  public checkAuthenticationType(user: User, value?: string): void {
    if (!value) {
      this.intervals.set(
        user.userId,
        setInterval(() => this.prepareEmailAuthentication(user), 30)
      );
      throw new MissingAuthenticationException(AuthenticationType.EMAIL, user);
    }
    const pendingUser = this.currentlyPendingUsers.get(user.userId);
    if (pendingUser?.authenticationCredentials.email !== value) {
      throw new AuthenticationException('Email code is not provided!');
    }
  }

  public writeAuthenticationType(user: User, value?: string): User {
    if (!value && !user.email) {
      throw new AuthenticationException('No email-address provided!');
    }
    const secret = 'Hello World';
    const updatedUser = new User({ ...user, email: value, emailSecret: secret });
    return updatedUser;
  }

  private prepareEmailAuthentication(user: User): void {
    const hotp = this.hotpService.create(user.emailSecret as string, Random.randomNumber(8));
    user.authenticationCredentials.email = hotp;
    this.registerPendingUser(user);
    this.sendEmailWithHotp(user.email as string, hotp);
  }

  private sendEmailWithHotp(email: string, hotp: string): void {}
}
