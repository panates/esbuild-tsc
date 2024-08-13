import fs from 'node:fs';
import path from 'node:path';
import { inspect } from 'node:util';
import type { Plugin } from 'esbuild';
import stripComments from 'strip-comments';
import typescript from 'typescript';

const DECORATOR_PATTERN = /((?<![(\s]\s*['"])@\(?\w*\w\s*(?!;)[(?=\s)])/;

export default function esbuildPluginTsc(options?: {
  tsconfigPath?: string;
  force?: boolean;
  tsx?: boolean;
}): Plugin {
  const tsconfigPath =
    options?.tsconfigPath || path.join(process.cwd(), './tsconfig.json');
  const tsx = options?.tsx ?? true;
  return {
    name: 'tsc',
    setup(build) {
      let parsedTsConfig: typescript.ParsedCommandLine;

      build.onLoad({ filter: tsx ? /\.tsx?$/ : /\.ts$/ }, async args => {
        if (!parsedTsConfig) {
          parsedTsConfig = parseTsConfig(tsconfigPath, process.cwd());
          if (parsedTsConfig.options.sourceMap) {
            parsedTsConfig.options.sourceMap = false;
            parsedTsConfig.options.inlineSources = true;
            parsedTsConfig.options.inlineSourceMap = true;
          }
        }

        // Just return if we don't need to search the file.
        if (
          !(parsedTsConfig?.options?.emitDecoratorMetadata || options?.force)
        ) {
          return;
        }

        let fileContent: string;
        try {
          fileContent = fs.readFileSync(args.path, 'utf8');
        } catch (err: any) {
          printDiagnostics({ file: args.path, err });
          return;
        }

        if (!options?.force) {
          // Find the decorator and if there isn't one, return out
          const hasDecorator = findDecorators(fileContent);
          if (!hasDecorator) {
            return;
          }
        }

        const program = typescript.transpileModule(fileContent, {
          compilerOptions: parsedTsConfig.options,
          fileName: path.basename(args.path),
        });
        return { contents: program.outputText };
      });
    },
  };
}

const findDecorators = (fileContent: string) =>
  DECORATOR_PATTERN.test(stripComments(fileContent));

function parseTsConfig(tsconfig: string, cwd = process.cwd()) {
  const fileName = typescript.findConfigFile(
    cwd,
    typescript.sys.fileExists,
    tsconfig,
  );

  // if the value was provided, but no file, fail hard
  if (tsconfig !== undefined && !fileName) {
    throw new Error(`failed to open '${fileName}'`);
  }

  let loadedConfig: any = {};
  let baseDir = cwd;
  if (fileName) {
    const text = typescript.sys.readFile(fileName);
    if (text === undefined) throw new Error(`failed to read '${fileName}'`);
    const result = typescript.parseConfigFileTextToJson(fileName, text);
    if (result.error !== undefined) {
      printDiagnostics(result.error);
      throw new Error(`failed to parse '${fileName}'`);
    }
    loadedConfig = result.config;
    baseDir = path.dirname(fileName);
  }

  const parsedTsConfig = typescript.parseJsonConfigFileContent(
    loadedConfig,
    typescript.sys,
    baseDir,
  );
  if (parsedTsConfig.errors[0]) printDiagnostics(parsedTsConfig.errors);
  return parsedTsConfig;
}

function printDiagnostics(...args: any[]) {
  // eslint-disable-next-line no-console
  console.log(inspect(args, false, 10, true));
}
