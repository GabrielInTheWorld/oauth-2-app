import { AuthenticationType } from './authentication-types';

export type AuthenticationCredential = {
  [key in AuthenticationType]?: string;
};
