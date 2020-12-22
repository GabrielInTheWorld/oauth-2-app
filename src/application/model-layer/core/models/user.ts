import { AuthenticationCredential } from './../../user/authentication-credential';
import { AuthenticationTypes } from '../../user/authentication-types';
import { BaseModel } from '../base/base-model';

export class User extends BaseModel {
  public static readonly COLLECTIONSTRING = 'user';

  public readonly username: string;
  public readonly userId: string;

  public readonly email?: string;
  public readonly password?: string;
  public readonly biometrics?: string;

  public readonly emailSecret?: string;
  public readonly totpT0: number;
  public readonly totpSecret?: string;
  public readonly authenticationCredentials: AuthenticationCredential = {};
  public readonly authenticationTypes: AuthenticationTypes[] = [];

  public constructor(input?: any) {
    super(User.COLLECTIONSTRING, input);
  }
}
