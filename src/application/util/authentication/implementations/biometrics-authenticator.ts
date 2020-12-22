import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { AuthenticationTypes } from '../../../model-layer/user/authentication-types';
import { BaseAuthenticator } from './base-authenticator';
import { MissingAuthenticationException } from '../../../model-layer/core/exceptions/missing-authentication-exception';
import { User } from './../../../model-layer/core/models/user';

export class BiometricsAuthenticator extends BaseAuthenticator {
  public checkAuthenticationType(user: User, value?: string): void {
    if (!value) {
      throw new MissingAuthenticationException(AuthenticationTypes.BIOMETRICS, user);
    }
    if (user.biometrics !== value) {
      throw new AuthenticationException('Biometrics are incorrect.');
    }
    this.doCleanUp(user.userId);
  }
}
