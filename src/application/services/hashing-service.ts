import crypto from 'crypto';

import { Digits } from './../interfaces/hashing-handler';
import { HashingHandler } from '../interfaces/hashing-handler';
import { Random } from '../util/helper';
import { Logger } from './logger';

export class HashingService extends HashingHandler {
  public hash(input: string): string {
    if (!input) {
      return '';
    }
    return this.sha512(input);
  }

  public isEquals(toHash: string, toCompare: string): boolean {
    if (!toHash || !toCompare || toCompare.length !== HashingHandler.HASHED_LENGTH) {
      return false;
    }
    return this.sha512(toHash, toCompare.slice(0, 64)) === toCompare;
  }

  public hotp(secret: string, randomValue?: string, digits: Digits = 6): string {
    if (!randomValue) {
      randomValue = Random.cryptoKey();
      // } else {
      //   randomValue = this.base32tohex(randomValue);
    }
    const hmacResult = crypto
      .createHmac('sha1', secret)
      .update(randomValue)
      .digest('hex');
    // Logger.debug('hmacResult:', hmacResult, hmacResult.length, hmacResult.slice(-2));
    const offset = parseInt(hmacResult.slice(-2), 16) & 0xf;
    // Logger.debug('offset', offset);
    // const binCode = parseInt(hmacResult.substr(offset, 8), 16) & parseInt('0x7fffffff', 16);
    const binCode =
      ((parseInt(hmacResult[offset], 16) & 0x7f) << 24) |
      ((parseInt(hmacResult[offset + 1], 16) & 0xff) << 16) |
      ((parseInt(hmacResult[offset + 2], 16) & 0xff) << 8) |
      (parseInt(hmacResult[offset + 3], 16) & 0xff);
    const hotp = binCode % Math.pow(10, digits);
    // console.log('code', hotp);
    return `${hotp}`;
  }

  public totp(secret: string, t0: number, digits: Digits = 6, t1?: number): string {
    if (!t1) {
      t1 = Math.round(new Date().getTime() / 1000);
    }
    // console.log('t1 and t0', new Date(t0).toString(), new Date(t1).toString());
    // t1 = Math.round(t1 / 1000.0);
    const timeSteps = Math.floor((t1 - t0) / 30);
    // console.log('timeSteps', timeSteps, (t1 - t0) / 30);
    return this.hotp(this.base32tohex(secret), timeSteps.toString(), digits);
  }

  public eotp(secret: string, counter: string, digits: Digits = 6): string {
    return this.hotp(secret, counter, digits);
  }

  /**
   * This function hashes a given value by `sha512` and adds a salt value.
   *
   * @param value The value, which is hashed.
   * @param salt A salt value, which is appended to the previous value.
   *
   * @returns The hashed value.
   */
  private sha512(value: string, salt?: string): string {
    const withSalt = salt ? salt : Random.cryptoKey(64);
    const hashValue = crypto
      .createHash('sha512')
      .update(value)
      .update(withSalt)
      .digest('base64');
    return withSalt + hashValue;
  }

  private base32tohex(base32: string): string {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let hex = '';
    let i = 0;
    while (i < base32.length) {
      const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
      bits += this.leftpad(val.toString(2), 5, '0');
      i++;
    }
    i = 0;
    while (i + 4 <= bits.length) {
      const chunk = bits.substr(i, 4);
      hex = hex + parseInt(chunk, 2).toString(16);
      i += 4;
    }
    return hex;
  }

  private leftpad(str: string, len: number, pad: string): string {
    if (len + 1 >= str.length) {
      str = Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
  }
}
