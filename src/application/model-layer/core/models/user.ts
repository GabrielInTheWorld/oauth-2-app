import { AuthenticationTypes } from '../../user/authentication-types';
import { BaseModel } from '../base/base-model';

export class User extends BaseModel {
  public static readonly COLLECTIONSTRING = 'user';

  public readonly username: string;
  public readonly password: string;
  public readonly userId: string;
  public readonly authenticationTypes: AuthenticationTypes[] = [];

  public constructor(input?: any) {
    super(User.COLLECTIONSTRING, input);
  }
}
