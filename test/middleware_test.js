import assert from 'assert';
import middleware from '../lib/main.js';

describe('middleware', () => {
  it('should be a function', () => {
    assert.equal(typeof middleware, 'function');
  });
});
