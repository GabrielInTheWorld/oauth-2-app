import { Authenticator } from '../interfaces/authenticator';
import { User } from './../../../model-layer/core/models/user';
import { Hotp, Totp } from 'final-otp';

export abstract class BaseAuthenticator implements Authenticator {
  protected hotpService = new Hotp();
  protected totpService = new Totp();

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
