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

  public abstract hotp(secret: string, randomValue?: string, digits?: Digits): string;
  public abstract totp(secret: string, t0: number, digits?: Digits, t1?: number): string;
  public abstract eotp(secret: string, counter: string, digits?: Digits): string;
}
