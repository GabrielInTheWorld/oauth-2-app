import { User } from '../../../model-layer/core/models/user';
import { FidoProviderService } from '../../../services/fido-provider-service';
import { Inject } from '../../../model-layer/core/modules/decorators';
import { BaseAuthenticator } from './base-authenticator';
import { Fido } from '../services/fido-service';

export class FidoAuthenticator extends BaseAuthenticator {
  @Inject(FidoProviderService)
  private readonly fidoProviderServer: FidoProviderService;

  public isAuthenticationTypeMissing(
    user: User,
    value?: any
  ): { missing: boolean; additionalData?: { [key: string]: any } } {
    // throw new Error('Method not implemented.');
    if (!value) {
      return { missing: true, additionalData: Fido.getLoginOptions(user) };
    } else {
      return { missing: !Fido.isSignatureValid(user, value) };
    }
  }

  public async prepareAuthenticationType(user: User, value?: any): Promise<User> {
    user.fido = await this.fidoProviderServer.register(user.username, user.userId);
    return user;
  }
}
