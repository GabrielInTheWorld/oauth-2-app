import { Authenticator } from '../interfaces/authenticator';
import { Inject } from '../../../model-layer/core/modules/decorators';
import { HashingHandler } from '../../../interfaces/hashing-handler';
import { HashingService } from './../../../services/hashing-service';
import { User } from './../../../model-layer/core/models/user';

export abstract class BaseAuthenticator implements Authenticator {
  @Inject(HashingService)
  protected hashingHandler: HashingHandler;

  protected currentlyPendingUsers = new Map<string, User>();
  protected intervals = new Map<string, NodeJS.Timeout>();

  public abstract checkAuthenticationType(user: User, value?: string): void;
  public abstract writeAuthenticationType(user: User, value?: string): any;

  protected registerPendingUser(user: User): void {
    this.currentlyPendingUsers.set(user.userId, user);
  }

  protected doCleanUp(userId: string): void {
    const interval = this.intervals.get(userId);
    if (interval) {
      clearInterval(interval);
    }
    this.currentlyPendingUsers.delete(userId);
    this.intervals.delete(userId);
  }
}
