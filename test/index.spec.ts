import { FakeUtils } from './utils';

test('Server is available', async () => {
  const result = await FakeUtils.requestGet('');
  // console.log('result:', result);
  expect(result.success).toBe(true);
});
