import { User } from './../models/user';
import { AuthenticationType } from './../../user/authentication-types';
import { BaseException } from './base-exception';

export class MissingAuthenticationException extends BaseException {
  private readonly user: User;
  private readonly missingType: AuthenticationType;

  public constructor(type: AuthenticationType, user: User) {
    super(`Type ${type} is missing in authentication by user: ${user.userId}`);
    this.user = user;
    this.missingType = type;
  }

  public getUser(): User {
    return this.user;
  }

  public getMissingType(): AuthenticationType {
    return this.missingType;
  }
}
