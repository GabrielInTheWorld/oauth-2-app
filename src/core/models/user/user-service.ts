import { uuid } from 'uuidv4';

import User from './user';
import { UserServiceInterface } from './user-service.interface';
import DatabaseAdapter from '../../../adapter/services/database-adapter';
import { DatabasePort } from '../../../adapter/interfaces/database-port';
import { Constructable, Inject } from '../../modules/decorators';

@Constructable(UserServiceInterface)
export default class UserService implements UserServiceInterface {
  public name = 'UserService';

  @Inject(DatabasePort, User)
  private readonly database: DatabaseAdapter;

  private readonly clientCollection: Map<string, User> = new Map();

  public constructor() {
    this.getAllClientsFromDatabase().then(clients => this.initClientCollection(clients));
  }

  public async create(username: string, password: string): Promise<User> {
    const clientId = uuid();
    const client: User = new User({ username, password, clientId });
    const done = await this.database.set(User.COLLECTIONSTRING, clientId, client);
    if (done) {
      this.clientCollection.set(clientId, client);
    }
    return client;
  }

  public async getUserByCredentials(username: string, password: string): Promise<User | undefined> {
    const clients = this.getAllUsers();
    return clients.find(c => c.username === username && c.password === password);
  }

  public async getUserBySessionId(sessionId: string): Promise<User | undefined> {
    const clients = this.getAllUsers();
    return clients.find(c => c.sessionId === sessionId);
  }

  public async hasUser(username: string, password: string): Promise<boolean> {
    const clients = this.getAllUsers();
    return !!clients.find(client => client.username === username && client.password === password);
  }

  public getAllUsers(): User[] {
    return Array.from(this.clientCollection.values());
  }

  private async getAllClientsFromDatabase(): Promise<User[]> {
    return await this.database.getAll(User.COLLECTIONSTRING);
  }

  private initClientCollection(clients: User[]): void {
    for (const client of clients) {
      this.clientCollection.set(client.clientId, client);
    }
  }
}
