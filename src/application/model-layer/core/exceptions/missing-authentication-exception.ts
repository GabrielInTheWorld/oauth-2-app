import { User } from './../models/user';
import { AuthenticationType } from './../../user/authentication-types';
import { BaseException } from './base-exception';

export class MissingAuthenticationException extends BaseException {
  private readonly user: User;
  private readonly missingType: AuthenticationType[] = [];

  public constructor(user: User, ...missingTypes: AuthenticationType[]) {
    super(`Types ${missingTypes} are missing in authentication by user: ${user.userId}`);
    this.user = user;
    this.missingType = missingTypes;
  }

  public getUser(): User {
    return this.user;
  }

  public getMissingTypes(): AuthenticationType[] {
    return this.missingType;
  }
}
