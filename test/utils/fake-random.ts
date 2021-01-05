import { Random } from '../../src/application/util/helper';

export namespace FakeRandom {
  export function randomNumber(length: number = 32): number {
    return Random.randomNumber(length);
  }
}
