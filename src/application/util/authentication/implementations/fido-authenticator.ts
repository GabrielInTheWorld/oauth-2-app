import { User } from 'src/application/model-layer/core/models/user';
import { BaseAuthenticator } from './base-authenticator';

export class FidoAuthenticator extends BaseAuthenticator {
  public isAuthenticationTypeMissing(user: User, value?: string): boolean {
    throw new Error('Method not implemented.');
  }
}
