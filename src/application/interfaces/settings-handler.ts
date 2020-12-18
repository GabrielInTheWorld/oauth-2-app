import { AuthenticationTypes } from '../model-layer/user/authentication-types';

export interface SettingsObject {
  defaultAuthenticationMethod: AuthenticationTypes;
  [key: string]: any;
}

export abstract class SettingsHandler {
  public abstract setSetting(key: keyof SettingsObject | string, value: any): void;
  public abstract getSetting(key: keyof SettingsObject | string): any;
  public abstract getDefaultSettings(): SettingsObject;
}
