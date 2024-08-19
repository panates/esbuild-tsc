import esbuildTsc from '../src/index.js';

describe(`plugin tests`, () => {
  it(`should create the plugin`, () => {
    const plugin = esbuildTsc();
    expect(plugin).toBeDefined();
    expect(typeof plugin.name).toBe('string');
    expect(plugin.setup).toBeInstanceOf(Function);
  });
});
