import { User } from './../models/user';
import { AuthenticationType } from './../../user/authentication-types';
import { BaseException } from './base-exception';

export class MissingAuthenticationException extends BaseException {
  private readonly user: User;

  public constructor(type: AuthenticationType, user: User) {
    super(`Type ${type} is missing in authentication by user: ${user.userId}`);
    this.user = user;
  }

  public getUser(): User {
    return this.user;
  }
}
