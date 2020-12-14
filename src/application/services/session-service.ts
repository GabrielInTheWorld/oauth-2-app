import { DatabaseAdapter } from '../../adapter/services/database-adapter';
import { DatabasePort, ReplicaObject } from '../../adapter/interfaces/database-port';
import { Constructable, Factory, Inject } from '../model-layer/core/modules/decorators';
import { Random } from '../util/helper';
import { SessionHandler } from '../interfaces/session-handler';
import { User } from '../model-layer/core/models/user';
import { Logger } from './logger';

@Constructable(SessionHandler)
export class SessionService extends SessionHandler {
  @Inject(DatabaseAdapter)
  private readonly database: DatabasePort;

  private sessionDatabase: ReplicaObject;
  private userDatabase: ReplicaObject;

  // private readonly activeSessions: Map<string, User> = new Map();
  // private readonly activeUsers: Map<string, User> = new Map();

  public constructor() {
    super();
    this.database.getReplicaObject(SessionHandler.SESSION_KEY).then(object => (this.sessionDatabase = object));
    this.database.getReplicaObject(SessionHandler.USER_KEY).then(object => (this.userDatabase = object));
  }

  public async getAllActiveSessions(): Promise<string[]> {
    // return Array.from(this.activeSessions.keys());
    return await this.sessionDatabase.keys();
  }

  public async getAllActiveUsers(): Promise<string[]> {
    return await this.userDatabase.keys();
  }

  public async clearSessionById(sessionId: string): Promise<void> {
    // if (this.activeSessions.has(sessionId)) {
    //   this.activeSessions.delete(sessionId);
    // }
    const userId = await this.sessionDatabase.get<string>(sessionId);
    const currentSessions = await this.userDatabase.get<string[]>(userId, []);
    if (currentSessions.length) {
      currentSessions.splice(
        currentSessions.findIndex(session => session === sessionId),
        1
      );
    }
    await this.userDatabase.set(userId, currentSessions);
    await this.removeSession(sessionId);
  }

  public async clearAllSessionsExceptThemselves(exceptSessionId: string): Promise<void> {
    // const sessions = (await this.getAllActiveSessions()).filter(session => session !== exceptSessionId);
    // for (const session of sessions) {
    //   this.activeSessions.delete(session);
    // }
    const userId = await this.sessionDatabase.get<string>(exceptSessionId);
    const currentSessions = await this.userDatabase.get<string[]>(userId, []);
    await Promise.all(
      currentSessions.map(session => {
        if (session !== exceptSessionId) {
          return this.removeSession(session);
        }
      })
    );
  }

  public async hasSession(sessionId: string): Promise<boolean> {
    // return this.activeSessions.has(sessionId);
    return !!(await this.sessionDatabase.get(sessionId));
  }

  public async addSession(user: User): Promise<string> {
    const currentSessions: string[] = (await this.userDatabase.get<string[]>(user.userId), []);
    const newSession = Random.cryptoKey();
    currentSessions.push(newSession);
    Logger.debug('CurrentSessions', currentSessions);
    await Promise.all([
      this.sessionDatabase.set(newSession, user.userId),
      this.userDatabase.set(user.userId, currentSessions)
    ]);
    return newSession;
  }

  public async getUserIdBySessionId(sessionId: string): Promise<string> {
    Logger.debug('All active sessions:', await this.sessionDatabase.keys());
    return await this.sessionDatabase.get(sessionId);
  }

  private async removeSession(sessionId: string): Promise<void> {
    await this.sessionDatabase.remove(sessionId).catch(reason => Logger.error('Could not remove session: ', reason));
  }
}
