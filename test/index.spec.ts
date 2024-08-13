import esbuildPluginTsc from '../src/index.js';

describe(`plugin tests`, () => {
  it(`should create a plugin`, () => {
    const plugin = esbuildPluginTsc();
    expect(plugin).toBeDefined();
  });
});
