import test from 'node:test';
import assert from 'node:assert';
import { config } from '../phone-numbers.js';

test('simple ESM test', async (t) => {
  assert.doesNotThrow(() => config([]));
});
