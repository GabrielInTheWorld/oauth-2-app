import { User } from './../../../model-layer/core/models/user';

export interface Authenticator {
  checkAuthenticationType(user: User, value?: string): void;
}
