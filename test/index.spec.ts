import esbuildPluginTsc from '../src/index.js';

describe(`plugin tests`, () => {
  it(`should create the plugin`, () => {
    const plugin = esbuildPluginTsc();
    expect(plugin).toBeDefined();
    expect(typeof plugin.name).toBe('string');
    expect(plugin.setup).toBeInstanceOf(Function);
  });

  it(`should set tsconfigPath option if not set`, () => {
    const plugin = esbuildPluginTsc();
    expect(plugin.options.tsconfigPath).toStrictEqual('tsconfig.json');
  });

  it(`should set filter option if not set`, () => {
    const plugin = esbuildPluginTsc();
    expect(plugin.options.filter).toStrictEqual(/\.tsx?$/);
  });
});
