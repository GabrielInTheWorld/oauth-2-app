import { FakeUser } from './utils/fake-user';
import { FakeUtils } from './utils';
test('Test two auth', () => {
  const user = new FakeUser();
  const hashing = FakeUtils.getHashingHandler();
  //   const startTime = 1608674376940 - 5000000;
  const startTime = user.t0;
  // for (let i = 0; i < 2000; ++i) {
  //   const comparison = hashing.totp(user.secret, user.t0, 6, (startTime + i * 30) * 1000);
  //   console.log(`Compare ${user.code} to ${comparison}`);
  //   if (user.code === comparison) {
  //     console.log(`Found! After ${i} seconds.`);
  //     break;
  //   }
  // }
  for (let i = 0; i < 90; ++i) {
    const comparison = hashing.totp(user.secret, user.t0, 6, user.t0 + i);
    console.log('comparison', comparison);
    if (user.code === comparison) {
      console.log(`Found! After ${i} steps.`);
    }
  }

  expect(true).toBe(true);
});
