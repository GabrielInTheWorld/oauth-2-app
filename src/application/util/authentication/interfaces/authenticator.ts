import { User } from './../../../model-layer/core/models/user';

export interface Authenticator {
  isAuthenticationTypeMissing(user: User, value?: string): boolean;
  /**
   * @deprecated Do not use! Use `isAuthenticationTypeMissing` instead!
   * @param user
   * @param value
   */
  checkAuthenticationType(user: User, value?: string): void;
  /**
   * @deprecated Do not use!
   * @param user
   * @param value
   */
  writeAuthenticationType(user: User, value?: string): any;
}
