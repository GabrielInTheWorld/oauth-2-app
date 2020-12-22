import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { AuthenticationTypes } from './../../../model-layer/user/authentication-types';
import { Authenticator } from './../interfaces/authenticator';
import { Logger } from './../../../services/logger';
import { MissingAuthenticationException } from '../../../model-layer/core/exceptions/missing-authentication-exception';
import { User } from './../../../model-layer/core/models/user';

export class PasswordAuthenticator implements Authenticator {
  public checkAuthenticationType(user: User, value?: string): void {
    if (!value) {
      throw new MissingAuthenticationException(AuthenticationTypes.PASSWORD, user);
    }
    if (user.password !== value) {
      Logger.debug(`Password does not match. Received: ${value} -- Expected: ${user.password}.`);
      throw new AuthenticationException('Username or password is incorrect.');
    }
  }
}
