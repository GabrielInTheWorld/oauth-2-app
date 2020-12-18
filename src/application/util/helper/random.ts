import crypto from 'crypto';

export namespace Random {
  export function id(length: number = 32): string {
    return cryptoKey(length);
  }

  export function cryptoKey(length: number = 32): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }
}
