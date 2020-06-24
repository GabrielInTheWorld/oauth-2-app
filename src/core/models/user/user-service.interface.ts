import User from './user';
import { InjectableClass } from '../../modules/decorators/injectable';

export class UserServiceInterface extends InjectableClass {
  public create: (username: string, password: string) => Promise<User>;
  public getUserByCredentials: (username: string, password: string) => Promise<User | undefined>;
  public getUserBySessionId: (sessionId: string) => Promise<User | undefined>;
  public hasUser: (username: string, password: string) => Promise<boolean>;
  public getAllUsers: () => User[];
}
