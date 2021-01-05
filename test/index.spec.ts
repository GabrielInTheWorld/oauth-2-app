import { FakeUtils } from './utils';
import { FakeRandom } from './utils/fake-random';

test('Server is available', async () => {
  const result = await FakeUtils.requestGet('');
  // console.log('result:', result);
  expect(result.success).toBe(true);
});

test('Random number', () => {
  const rand = FakeRandom.randomNumber(8);
  expect(rand.toString().length).toBe(8);
});
