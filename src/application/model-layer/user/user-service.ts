import { AuthenticationType } from './authentication-types';
import { DatabaseAdapter } from '../../../adapter/services/database-adapter';
import { DatabasePort, ReplicaObject } from '../../../adapter/interfaces/database-port';
import { Constructable, Inject } from '../core/modules/decorators';
import { Logger } from '../../../application/services/logger';
import { User } from '../core/models/user';
import { UserHandler } from './user-handler';

@Constructable(UserHandler)
export class UserService extends UserHandler {
  @Inject(DatabaseAdapter)
  private readonly database: DatabasePort;

  private userDatabase: ReplicaObject;

  private userCounter = 0;

  public get defaultAuthenticationMethod(): AuthenticationType[] {
    return this._defaultAuthenticationMethods;
  }

  private _defaultAuthenticationMethods = [AuthenticationType.PASSWORD, AuthenticationType.TOTP];

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
    const userId = (++this.userCounter).toString();
    const user: User = new User({
      username,
      password,
      userId,
      authenticationTypes: [...this.defaultAuthenticationMethod]
    });
    await this.userDatabase.set(`${userId}`, user);
    return user;
  }

  public async update(userId: string, update: Partial<User>): Promise<void> {
    const user = await this.getUserByUserId(userId);
    const updatedUser = { ...user, ...update };
    await this.userDatabase.set(userId, updatedUser);
  }

  private async updateAll(update: Partial<User>): Promise<void> {
    const users = await this.getAllUsers();
    users.forEach(user => user.update({ ...update }));
    const promises = users.map(user => this.userDatabase.set(user.userId, user));
    await Promise.all(promises);
  }

  public async getUserByUsername(username: string): Promise<User> {
    const users = await this.userDatabase.find<User>('username', username);
    if (users.length > 1) {
      throw new Error('Find multiple users');
    }
    if (!users.length) {
      throw new Error('User not found');
    }
    return users[0];
  }

  public async getUserByUserId(userId: string): Promise<User> {
    Logger.debug(`Try to get user with userId: ${userId}`);
    // const users = await this.userDatabase.find<User>('userId', userId);
    const users = await this.userDatabase.get<User>(userId);
    // if (users.length > 1) {
    //   throw new Error('Find multiple users');
    // }
    // if (!users.length) {
    //   throw new Error('User not found');
    // }
    // return users[0];
    if (!users) {
      Logger.debug('User not found');
      throw new Error('User not found');
    }
    return users;
  }

  public async getAllUsers(): Promise<User[]> {
    const users = await this.userDatabase.getAll<User>();
    Logger.debug('Users', users);
    return users.map(user => new User(user));
  }

  public async hasUser(username: string, password: string): Promise<boolean> {
    const users = await this.userDatabase.find<User>('username', username);
    return users.length === 1 && users[0].password === password;
  }

  public setDefaultAuthenticationTypes(types: AuthenticationType[]): Promise<void> {
    this._defaultAuthenticationMethods = types;
    return this.updateAll({ authenticationTypes: types });
  }

  private async mockUserData(): Promise<void> {
    const user = (await this.userDatabase.find<User>('username', 'admin'))[0];
    Logger.debug('mockUserData', user);
    if (!user) {
      await this.create('admin', 'admin');
    } else {
      if (!user.authenticationTypes || !user.authenticationTypes.length) {
        await this.update(user.userId, {
          authenticationTypes: [...this.defaultAuthenticationMethod]
        });
      }
    }
  }
}
