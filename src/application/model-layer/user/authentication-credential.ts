import { AuthenticationTypes } from './authentication-types';

export type AuthenticationCredential = {
  [key in AuthenticationTypes]?: string;
};
