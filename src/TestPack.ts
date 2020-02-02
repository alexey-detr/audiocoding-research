import Codec from './Codec';
import { Test } from './Test';
import { Spectrum } from './Spectrum';
import { format } from 'date-fns';
import { promises } from 'fs';
import path from 'path';

const { writeFile } = promises;

type DiffStat = {
  codec: Codec,
  diffData: number[],
};

type SizeStat = {
  codec: Codec,
  encodedFileSize: number,
};

type TimeStat = {
  codec: Codec,
  encodingTime: number,
  decodingTime: number,
};

export class TestPack {
  codecs: Codec[] = [];
  diffStats: DiffStat[] = [];
  sizeStats: SizeStat[] = [];
  timeStats: TimeStat[] = [];
  referenceWavPath: string;
  referenceSpectrum: Spectrum;
  testPackName: string;
  testPackPath: string;

  constructor(referenceWavPath: string, referenceSpectrum: Spectrum) {
    this.testPackName = format(Date.now(), 'yyyy-MM-dd-HH-mm-ss');
    this.referenceWavPath = referenceWavPath;
    this.referenceSpectrum = referenceSpectrum;
    this.testPackPath = path.resolve(
      __dirname,
      '..',
      'results',
      this.testPackName,
    );
  }

  addCodec(codec: Codec) {
    this.codecs.push(codec);
  }

  async run() {
    for (const codec of this.codecs) {
      const test = new Test(this.referenceWavPath, this.referenceSpectrum, codec, this.testPackName);
      await test.run();
      this.diffStats.push({ codec, diffData: test.diff });
      this.sizeStats.push({ codec, encodedFileSize: test.encodedFileSize });
      this.timeStats.push({ codec, encodingTime: test.encodingTime, decodingTime: test.decodingTime });
    }

    await this.outputDiffStats(this.getDiffStatsPath());
    await this.outputSizeStats(this.getSizeStatsPath());
    await this.outputTimeStats(this.getTimeStatsPath());
  }

  private getDiffStatsPath() {
    return `${this.testPackPath}/diff_stats.csv`;
  }

  private static formatHz(num: number): string {
    return String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1 ');
  }

  async outputDiffStats(outputFilePath: string) {
    const values = this.diffStats[0].diffData;
    let resultData = 'Частота, Гц\t';
    resultData += this.diffStats.map(stat => stat.codec.configurationName).join('\t');
    resultData += '\n';
    const frequencyLabels = [];
    for (let i = 1; i <= values.length; i += 1) {
      const frequency = Math.round(i * (22050 / values.length));
      frequencyLabels.push(Math.round(frequency / 50) * 50);
    }
    for (let i = 0; i < values.length; i += 1) {
      resultData += TestPack.formatHz(frequencyLabels[i]) + '\t' +
        this.diffStats.map(diff => diff.diffData[i].toFixed(4).replace('.', ',')).join('\t') +
        '\n';
    }
    await writeFile(outputFilePath, resultData);
  }

  private getSizeStatsPath() {
    return `${this.testPackPath}/size_stats.csv`;
  }

  async outputSizeStats(outputFilePath: string) {
    let data = 'Кодек\tРазмер, Б\n';
    data += this.sizeStats.map(stat => stat.codec.configurationName + '\t' + stat.encodedFileSize).join('\n');
    await writeFile(
      outputFilePath,
      data,
    );
  }

  private getTimeStatsPath() {
    return `${this.testPackPath}/time_stats.csv`;
  }

  async outputTimeStats(outputFilePath: string) {
    let data = 'Кодек\tКодирование, мс\tДекодирование, мс\n';
    data += this.timeStats.map(stat => (
      stat.codec.configurationName + '\t' + stat.encodingTime + '\t' + stat.decodingTime
    )).join('\n');
    await writeFile(
      outputFilePath,
      data,
    );
  }
}
