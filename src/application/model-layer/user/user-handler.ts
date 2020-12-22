import { User } from '../core/models/user';

export abstract class UserHandler {
  public abstract create(username: string, password: string): Promise<User>;
  public abstract getUserByUsername(username: string): Promise<User>;
  public abstract getUserByUserId(userId: string): Promise<User>;
  public abstract getAllUsers(): Promise<User[]>;
  public abstract hasUser(username: string, password: string): Promise<boolean>;
}
