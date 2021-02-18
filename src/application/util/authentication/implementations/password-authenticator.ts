import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { BaseAuthenticator } from './base-authenticator';
import { Logger } from './../../../services/logger';
import { User } from './../../../model-layer/core/models/user';

export class PasswordAuthenticator extends BaseAuthenticator {
  public isAuthenticationTypeMissing(user: User, value?: string): boolean {
    Logger.debug(`Check a new user with user userId: ${user.userId}: `, user);
    if (!value) {
      Logger.debug('Password not provided!');
      return true;
    }
    Logger.debug(`Password received: ${value}. Password expected: ${user.password}`);
    if (user.password !== value) {
      Logger.debug(`Password does not match. Received: ${value} -- Expected: ${user.password}.`);
      throw new AuthenticationException('Username or password is incorrect.');
    }
    return false;
  }
}
