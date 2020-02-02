import * as fsSync from 'fs';
import Codec from './codec';
import slugify from 'slugify';
import { Sox } from './sox';
import { Spectrum } from './spectrum';
import {
    parse,
    resolve,
} from 'path';

const { writeFile, mkdir, stat } = fsSync.promises;

export class Test {
  referenceWavPath: string;
  referenceSpectrum: Spectrum;
  resultsPath: string;
  codec: Codec;
  diff: number[] = [];
  encodingTime = 0;
  decodingTime = 0;
  encodedFileSize = 0;
  encodingCommandLineTemplate: string;
  decodingCommandLineTemplate: string;

  constructor(referenceWavPath: string, referenceSpectrum: Spectrum, codec: Codec, testName: string) {
    this.referenceWavPath = resolve(referenceWavPath);
    this.referenceSpectrum = referenceSpectrum;
    this.codec = codec;
    const slug = slugify(codec.configurationName);
    this.resultsPath = resolve(
      __dirname,
      '..',
      'results',
      testName,
      slug,
    );

    this.encodingCommandLineTemplate = this.getEncodingCommandLine();
    this.decodingCommandLineTemplate = this.getDecodingCommandLine();

    this.codec.prepareEncodeArgs(new Map([
      ['input', this.referenceWavPath],
      ['output', this.getEncodedPath()],
    ]));
    this.codec.prepareDecodeArgs(new Map([
      ['input', this.getEncodedPath()],
      ['output', this.getDecodedPath()],
    ]));
  }

  public async run() {
    await mkdir(this.resultsPath, { recursive: true });
    await this.encode();

    const fileStat = await stat(this.getEncodedPath());
    this.encodedFileSize = fileStat.size;

    await this.decode();
    await this.buildSpectrogram();
    await this.analyzeSpectrum();
    await this.writeMeta();
  }

  private async encode() {
    console.log('Encoding', this.codec.configurationName);
    console.log(this.encodingCommandLineTemplate);
    const input = fsSync.createReadStream(this.referenceWavPath);
    const output = fsSync.createWriteStream(this.getEncodedPath());
    const startTimestamp = Date.now();
    await this.codec.encode(input, output);
    this.encodingTime = Date.now() - startTimestamp;
  }

  private getEncodedPath() {
    return resolve(this.resultsPath, `encoded${this.codec.options.extension}`);
  }

  private getEncodingCommandLine() {
    return parse(this.codec.encoderBinPath).base + ' ' + this.codec.encoderArgs.join(' ');
  }

  private async decode() {
    console.log('Decoding', this.codec.configurationName);
    console.log(this.decodingCommandLineTemplate);
    const input = fsSync.createReadStream(this.getEncodedPath());
    const output = fsSync.createWriteStream(this.getDecodedPath());
    const startTimestamp = Date.now();
    await this.codec.decode(input, output);
    this.decodingTime = Date.now() - startTimestamp;
  }

  private getDecodedPath() {
    return resolve(this.resultsPath, `decoded.${this.codec.options.raw ? 'raw' : 'wav'}`);
  }

  private getDecodingCommandLine() {
    return parse(this.codec.decoderBinPath).base + ' ' + this.codec.decoderArgs.join(' ');
  }

  private buildSpectrogram() {
    console.log('Spectrogram');
    const sox = new Sox(this.getDecodedPath());
    return sox.buildSpectrumImage(this.getSpectrumImagePath(), this.codec.options.raw);
  }

  private getSpectrumImagePath() {
    return `${this.resultsPath}/spectrogram.png`;
  }

  private getMeta() {
    const { encodingTime, decodingTime, encodedFileSize } = this;
    const { name, version } = this.codec;
    return {
      runAt: new Date().toISOString(),
      encodingTime,
      decodingTime,
      encodedFileSize,
      codec: {
        name,
        version,
        encodingCommandLine: this.getEncodingCommandLine(),
        decodingCommandLine: this.getDecodingCommandLine(),
        encodingCommandLineTemplate: this.encodingCommandLineTemplate,
        decodingCommandLineTemplate: this.decodingCommandLineTemplate,
      },
    };
  }

  private writeMeta() {
    return writeFile(this.resultsPath + '/meta.json', JSON.stringify(this.getMeta(), null, 2));
  }

  private getFrequencyDiffPath() {
    return `${this.resultsPath}/diff.csv`;
  }

  private async analyzeSpectrum() {
    const spectrum = new Spectrum(this.getSpectrumImagePath());
    await spectrum.parse();
    const diff = spectrum.diff(this.referenceSpectrum);
    this.diff = await spectrum.getFrequencyDiff(diff);
    await Test.outputFrequencyDiff(this.diff, this.getFrequencyDiffPath());
  }

  static outputFrequencyDiff(values: number[], outputFilePath: string) {
    let resultData = 'Частота, Гц;Искажения, %\n';
    const frequencyLabels = [];
    for (let i = 1; i <= values.length; i += 1) {
      const frequency = Math.round(i * (22050 / values.length));
      frequencyLabels.push(Math.round(frequency / 50) * 50);
    }
    for (let i = 0; i < values.length; i += 1) {
      resultData += frequencyLabels[i] + ';' + values[i].toFixed(4).replace('.', ',') + '\n';
    }
    return writeFile(outputFilePath, resultData);
  }
}
