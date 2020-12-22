import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { AuthenticationType } from './../../../model-layer/user/authentication-types';
import { BaseAuthenticator } from './base-authenticator';
import { Logger } from './../../../services/logger';
import { MissingAuthenticationException } from '../../../model-layer/core/exceptions/missing-authentication-exception';
import { User } from './../../../model-layer/core/models/user';

export class PasswordAuthenticator extends BaseAuthenticator {
  public checkAuthenticationType(user: User, value?: string): void {
    Logger.debug(`Check a new user with user userId: ${user.userId}: `, user);
    if (!value) {
      throw new MissingAuthenticationException(AuthenticationType.PASSWORD, user);
    }
    Logger.debug(`Password received: ${value}. Password expected: ${user.password}`);
    if (user.password !== value) {
      Logger.debug(`Password does not match. Received: ${value} -- Expected: ${user.password}.`);
      throw new AuthenticationException('Username or password is incorrect.');
    }
  }

  public writeAuthenticationType(user: User, value?: string): any {
    Logger.debug('user:', user);
    if (!value && !user.password) {
      throw new AuthenticationException('A value for a password has to be given!');
    }
    const updatedUser = new User({ ...user, password: value || user.password });
    return updatedUser;
  }
}
