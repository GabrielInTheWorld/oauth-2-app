import { Authentication } from '../util/authentication/authentication';
import { AuthenticationCredential } from '../model-layer/user/authentication-credential';
import { AuthenticationType } from '../model-layer/user/authentication-types';
import { User } from './../model-layer/core/models/user';

export interface SettingsObject {
  defaultAuthenticationMethod: AuthenticationType;
  [key: string]: any;
}

/**
 * @deprecated
 *
 * @export
 * @abstract
 * @class SettingsHandler
 */
export abstract class SettingsHandler {
  public abstract setSetting(key: keyof SettingsObject | string, value: any): void;
  public abstract getSetting(key: keyof SettingsObject | string): any;
  public abstract getDefaultSettings(): SettingsObject;
  public abstract getAuthenticationMethods(userId: number): Promise<AuthenticationType[]>;
  public abstract setAuthenticationMethod(
    userId: number,
    authenticationTypes: AuthenticationType[],
    initialValues: AuthenticationCredential
  ): Promise<Authentication.InitialValues>;
  public abstract setAuthenticationMethodOfOthers(types: AuthenticationType[]): Promise<void>;
  public abstract confirmTotp(userId: string, code: string): Promise<void>;
}
