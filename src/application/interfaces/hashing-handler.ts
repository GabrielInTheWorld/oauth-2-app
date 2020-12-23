export type Digits = 6 | 7 | 8;

export abstract class HashingHandler {
  /**
   * The length of a hashed value, which was hashed by this service.
   */
  public static readonly HASHED_LENGTH = 152;

  /**
   * This function hashes a given value.
   *
   * @param value The value to hash.
   *
   * @returns The hashed value.
   */
  public abstract hash(value: string): string;

  /**
   * Hashes a given value and compares it with a second one (that is already hashed).
   * `toCompare` have to be a hashed value from this service, otherwise `false` is returned.
   *
   * @param toHash a value that is hashed.
   * @param toCompare a value that is compared to the `toHash`.
   *
   * @returns If the hashed value of `toHash` is equals to `comparingValue`.
   */
  public abstract isEquals(toHash: string, toCompare: string): boolean;

  /**
   * This generates an hotp token for a given secret. If a random-value is not provided,
   * it takes a random created one.
   * The random-value MUST given as HEX.
   *
   * @param secret: A secret to calculate an hotp from. This MUST be given as HEX.
   * @param [randomValue] An optional random-value. This MUST be given as HEX.
   * @param [digits] An optional number of digits to generate. Defaults to `6`.
   *
   * @returns A generated hotp token as string.
   */
  public abstract hotp(secret: string, randomValue?: string, digits?: Digits): string;

  /**
   * This generates a totp token for a given secret. The secret is used in an hotp-algorithm.
   *
   *
   * @param  secret
   * @param  t0
   * @param  [digits]
   * @param  [t1]
   * @returns
   */
  public abstract totp(secret: string, t0: number, digits?: Digits, t1?: number): string;
  public abstract eotp(secret: string, counter: string, digits?: Digits): string;
}
