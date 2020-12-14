import { DatabaseAdapter } from '../../../adapter/services/database-adapter';
import { DatabasePort, ReplicaObject } from '../../../adapter/interfaces/database-port';
import { Constructable, Factory, Inject } from '../core/modules/decorators';
import { Random } from '../../../application/util/helper';
import { User } from '../core/models/user';
import { UserHandler } from './user-handler';
import { Logger } from '../../../application/services/logger';

@Constructable(UserHandler)
export class UserService extends UserHandler {
  public name = 'UserService';

  @Inject(DatabaseAdapter)
  private readonly database: DatabasePort;

  private userDatabase: ReplicaObject;

  private userCounter = 0;

  public constructor() {
    super();
    this.init();
  }

  private async init(): Promise<void> {
    this.userDatabase = await this.database.getReplicaObject(User.COLLECTIONSTRING, User as any, [
      'username',
      'userId'
    ]);
    const keys = await this.userDatabase.keys();
    this.userCounter = keys.length;
    this.mockUserData();
  }

  public async create(username: string, password: string): Promise<User> {
    const userId = ++this.userCounter;
    const user: User = new User({ username, password, userId });
    await this.userDatabase.set(`${userId}`, user);
    return user;
  }

  public async getUserByCredentials(username: string, password: string): Promise<User | undefined> {
    const users = await this.userDatabase.find<User>('username', username);
    if (users.length > 1) {
      throw new Error('Find multiple users');
    }
    if (users[0] && users[0].password === password) {
      return users[0];
    } else {
      throw new Error('User not found');
    }
  }

  public async getUserByUserId(userId: string): Promise<User | undefined> {
    Logger.debug(`Try to get user with userId: ${userId}`);
    const users = await this.userDatabase.find<User>('userId', userId);
    if (users.length > 1) {
      throw new Error('Find multiple users');
    }
    if (!users.length) {
      throw new Error('User not found');
    }
    return users[0];
  }

  public async hasUser(username: string, password: string): Promise<boolean> {
    const users = await this.userDatabase.find<User>('username', username);
    return users.length === 1 && users[0].password === password;
  }

  private async mockUserData(): Promise<void> {
    console.log('mockUserData', await this.userDatabase.find('username', 'admin'));
    if (!(await this.userDatabase.find<User>('username', 'admin'))[0]) {
      await this.create('admin', 'admin');
    }
  }
}
