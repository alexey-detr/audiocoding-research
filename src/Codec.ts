import {
    ReadStream,
    WriteStream,
} from 'fs';
import { spawn } from 'child_process';
import { parse } from 'path';

type Options = {
  extension: string,
  raw: boolean,
  pipe: boolean,
};

type ArgsMap = Map<string, string>;

export default class Codec {
  configurationName: string;
  encoderBinPath: string;
  decoderBinPath: string;
  encoderArgs: Array<string> = [];
  decoderArgs: Array<string> = [];
  name: string;
  version: string;
  options: Options;

  constructor(configurationName: string, encoderParams: Array<string>, decoderParams: Array<string>, options: Options) {
    this.configurationName = configurationName;

    const [encoderBinPath, ...encoderArgs] = encoderParams;
    const [decoderBinPath, ...decoderArgs] = decoderParams;
    this.encoderBinPath = encoderBinPath;
    this.decoderBinPath = decoderBinPath;
    this.encoderArgs = encoderArgs;
    this.decoderArgs = decoderArgs;
    this.options = options;

    this.prepareEncoderWineArgs();
    this.prepareDecoderWineArgs();

    const binDir = parse(parse(encoderBinPath).dir).base;
    const [name, ...versionParts] = binDir.split('-');
    this.name = name;
    this.version = versionParts.join('-');
  }

  private prepareEncoderWineArgs() {
    const parsedBinPath = parse(this.encoderBinPath);
    if (parsedBinPath.ext === '.exe') {
      this.encoderArgs.unshift(this.encoderBinPath);
      this.encoderBinPath = 'wine';
    }
  }

  private prepareDecoderWineArgs() {
    const parsedBinPath = parse(this.decoderBinPath);
    if (parsedBinPath.ext === '.exe') {
      this.decoderArgs.unshift(this.decoderBinPath);
      this.decoderBinPath = 'wine';
    }
  }

  prepareEncodeArgs(valuesMap: ArgsMap) {
    this.encoderArgs = this.encoderArgs.map(this.prepareArgs(valuesMap));
  }

  prepareDecodeArgs(valuesMap: ArgsMap) {
    this.decoderArgs = this.decoderArgs.map(this.prepareArgs(valuesMap));
  }

  private prepareArgs(valuesMap: ArgsMap) {
    return (arg: string) => {
      let result = arg;
      valuesMap.forEach((value, key) => result = result.replace(`<${key}>`, value));
      return result;
    };
  }

  encode(input: ReadStream, output: WriteStream) {
    return new Promise((resolve, reject) => {
      const subprocess = spawn(this.encoderBinPath, this.encoderArgs);
      if (this.options.pipe) {
        input.pipe(subprocess.stdin);
        subprocess.stdout.pipe(output);
        subprocess.stderr.pipe(process.stderr);
      } else {
        subprocess.stderr.on('data', (data) => console.error(data.toString()));
      }
      subprocess.on('close', (code) => {
        if (code !== 0) {
          return reject(code);
        }
        resolve();
      });
    });
  }

  decode(input: ReadStream, output: WriteStream) {
    return new Promise((resolve, reject) => {
      const subprocess = spawn(this.decoderBinPath, this.decoderArgs);
      if (this.options.pipe) {
        input.pipe(subprocess.stdin);
        subprocess.stdout.pipe(output);
        subprocess.stderr.pipe(process.stderr);
      } else {
        subprocess.stderr.on('data', (data) => console.error(data.toString()));
      }
      subprocess.on('close', (code) => {
        if (code !== 0) {
          return reject(code);
        }
        resolve();
      });
    });
  }
}
