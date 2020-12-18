import { User } from '../core/models/user';

export abstract class UserHandler {
  public abstract create(username: string, password: string): Promise<User>;
  public abstract getUserByCredentials(username: string, password: string): Promise<User | undefined>;
  public abstract getUserByUserId(userId: string): Promise<User | undefined>;
  public abstract getAllUsers(): Promise<User[]>;
  public abstract hasUser(username: string, password: string): Promise<boolean>;
}
