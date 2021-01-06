import { Digits } from 'final-otp';

export namespace Authentication {
  export interface OtpValues {
    type: 'hotp' | 'totp';
    secret: string; // base32
    digits?: Digits;
    issuer: string;
    to: string;
    period?: number;
    initialCounter?: number;
  }

  export interface InitialValues {
    emailSecret?: string;
    hotpUri?: string;
    totpUri?: string;
    password?: string;
    biometrics?: string;
  }

  export function otpToUri(options: OtpValues): string {
    let uri = `otpauth://${options.type}/${options.issuer}:${options.to}?secret=${options.secret}&issuer=${options.issuer}`;
    if (options.digits) {
      uri += `&digits=${options.digits}`;
    }
    if (options.period) {
      uri += `&period=${options.period}`;
    }
    if (options.initialCounter) {
      uri += `&counter=${options.initialCounter}`;
    }
    return uri;
  }
}
