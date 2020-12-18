import { AuthenticationTypes } from '../model-layer/user/authentication-types';
import { Constructable } from '../model-layer/core/modules/decorators';
import { SettingsHandler, SettingsObject } from '../interfaces/settings-handler';

@Constructable(SettingsHandler)
export class SettingsService extends SettingsHandler {
  private defaultSettings: SettingsObject = {
    defaultAuthenticationMethod: AuthenticationTypes.PASSWORD
  };

  public setSetting(key: keyof SettingsObject | string, value: any): void {
    this.defaultSettings[key] = value;
  }

  public getSetting(key: keyof SettingsObject | string): any {
    return this.defaultSettings[key];
  }

  public getDefaultSettings(): SettingsObject {
    return this.defaultSettings;
  }
}
