import { AuthenticationType } from './authentication-types';
import { User } from '../core/models/user';

export abstract class UserHandler {
  public abstract create(username: string, password: string): Promise<User>;
  public abstract update(userId: string, updatedUser: Partial<User>): Promise<void>;
  public abstract getUserByUsername(username: string): Promise<User>;
  public abstract getUserByUserId(userId: string): Promise<User>;
  public abstract getAllUsers(): Promise<User[]>;
  public abstract hasUser(username: string, password: string): Promise<boolean>;
  public abstract setDefaultAuthenticationTypes(types: AuthenticationType[]): Promise<void>;
}
