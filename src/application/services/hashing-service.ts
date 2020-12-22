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
    }
    const hmacResult = crypto
      .createHmac('sha1', secret)
      .update(randomValue)
      .digest('hex');
    Logger.debug('hmacResult:', hmacResult, hmacResult.length, hmacResult.slice(-2));
    const offset = parseInt(hmacResult.slice(-2), 16) & 0xf;
    Logger.debug('offset', offset);
    const binCode =
      ((parseInt(hmacResult[offset], 16) & 0x7f) << 24) |
      ((parseInt(hmacResult[offset + 1], 16) & 0xff) << 16) |
      ((parseInt(hmacResult[offset + 2], 16) & 0xff) << 8) |
      (parseInt(hmacResult[offset + 3], 16) & 0xff);
    const hotp = binCode % Math.pow(10, digits);
    console.log('code', hotp);
    return `${hotp}`;
  }

  public totp(secret: string, t0: number, digits: Digits = 6, t1: number = new Date().getTime()): string {
    console.log('t1 and t0', new Date(t0).toString(), new Date(t1).toString());
    const timeSteps = ((t1 - t0) / 30).toFixed(0);
    console.log('timeSteps', timeSteps, (t1 - t0) / 30);
    return this.hotp(secret, timeSteps.toString(), digits);
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
}
