import fs from 'node:fs';
import path from 'node:path';
import { inspect } from 'node:util';
import type { Plugin, PluginBuild } from 'esbuild';
import typescript from 'typescript';

function esbuildTsc(options?: esbuildTsc.Options): Plugin {
  const tsconfigPath = options?.tsconfigPath || 'tsconfig.json';
  return {
    name: 'tsc',
    setup(build: PluginBuild) {
      const parsedTsConfig = esbuildTsc.parseTsConfig(
        tsconfigPath,
        process.cwd(),
      );
      if (parsedTsConfig.options?.sourceMap) {
        parsedTsConfig.options.sourceMap = false;
        parsedTsConfig.options.inlineSources = true;
        parsedTsConfig.options.inlineSourceMap = true;
      }
      const filterFn =
        typeof options?.filter === 'function' ? options?.filter : undefined;

      build.onLoad(
        {
          filter:
            typeof options?.filter === 'object' ? options.filter : /\.tsx?$/,
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
    },
  };
}

export default esbuildTsc;

/**
 * @namespace esbuildTsc
 */
namespace esbuildTsc {
  export interface Options {
    tsconfigPath?: string;
    filter?:
      | RegExp
      | ((filename: string, tsconfig: typescript.ParsedCommandLine) => boolean);
  }

  export function parseTsConfig(
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
      printDiagnostics(parsedTsConfig.errors);
    }
    return parsedTsConfig;
  }

  export function printDiagnostics(...args: any[]) {
    // eslint-disable-next-line no-console
    console.log(inspect(args, false, 10, true));
  }
}
