import fs from 'node:fs';
import path from 'node:path';
import { inspect } from 'node:util';
import type { Plugin, PluginBuild } from 'esbuild';
import typescript from 'typescript';

function esbuildPluginTsc(
  options?: EsbuildPluginTsc.Options,
): EsbuildPluginTsc {
  return new EsbuildPluginTsc(options);
}

export default esbuildPluginTsc;

/**
 * @namespace EsbuildPluginTsc
 */
export namespace EsbuildPluginTsc {
  export interface Options {
    tsconfigPath?: string;
    filter?:
      | RegExp
      | ((filename: string, tsconfig: typescript.ParsedCommandLine) => boolean);
  }
}

/**
 * @class EsbuildPluginTsc
 */
export class EsbuildPluginTsc implements Plugin {
  name: string = 'tsc';
  options: Required<EsbuildPluginTsc.Options>;

  constructor(options?: EsbuildPluginTsc.Options) {
    this.options = {
      tsconfigPath: options?.tsconfigPath || 'tsconfig.json',
      filter: options?.filter || /\.tsx?$/,
    };
  }

  setup(build: PluginBuild) {
    const parsedTsConfig = this._parseTsConfig(
      this.options.tsconfigPath,
      process.cwd(),
    );
    if (parsedTsConfig.options?.sourceMap) {
      parsedTsConfig.options.sourceMap = false;
      parsedTsConfig.options.inlineSources = true;
      parsedTsConfig.options.inlineSourceMap = true;
    }
    const filterFn =
      typeof this.options.filter === 'function'
        ? this.options.filter
        : undefined;

    build.onLoad(
      {
        filter:
          typeof this.options.filter === 'object'
            ? this.options.filter
            : /\.tsx?$/,
      },
      async args => {
        if (filterFn) {
          if (!filterFn(args.path, parsedTsConfig)) return;
        } else if (!parsedTsConfig?.options?.emitDecoratorMetadata) {
          return;
        }

        const fileContent = fs.readFileSync(args.path, 'utf8');
        const program = typescript.transpileModule(fileContent, {
          compilerOptions: parsedTsConfig.options,
          fileName: path.basename(args.path),
        });
        return { contents: program.outputText };
      },
    );
  }

  protected _parseTsConfig(
    tsconfig: string,
    cwd = process.cwd(),
  ): typescript.ParsedCommandLine {
    const fileName = typescript.findConfigFile(
      cwd,
      typescript.sys.fileExists,
      tsconfig,
    );

    // if the value was provided, but no file, fail hard
    if (tsconfig !== undefined && !fileName) {
      throw new Error(`Unable to locate tsconfig'`);
    }

    let loadedConfig: any = {};
    let baseDir = cwd;
    if (fileName) {
      const text = typescript.sys.readFile(fileName);
      if (text === undefined) throw new Error(`failed to read '${fileName}'`);
      const result = typescript.parseConfigFileTextToJson(fileName, text);
      loadedConfig = result.config;
      baseDir = path.dirname(fileName);
    }

    const parsedTsConfig = typescript.parseJsonConfigFileContent(
      loadedConfig,
      typescript.sys,
      baseDir,
    );
    if (parsedTsConfig.errors.length) {
      this._printDiagnostics(parsedTsConfig.errors);
    }
    return parsedTsConfig;
  }

  protected _printDiagnostics(...args: any[]) {
    // eslint-disable-next-line no-console
    console.log(inspect(args, false, 10, true));
  }
}
