import { spawn } from 'child_process';
import { parse } from 'path';

export class Sox {
  filePath: string;
  raw: boolean;

  constructor(waveFilePath: string) {
    this.filePath = waveFilePath;
    this.raw = parse(waveFilePath).ext === '.raw';
  }

  buildSpectrumImage(outputPath: string, raw: boolean) {
    const args = [
      this.filePath,
      '-n', 'spectrogram',
      '-r',
      '-m',
      '-x', '5000',
      '-y', '257',
      '-o', outputPath,
    ];
    if (raw) {
      args.unshift(...[
        '-t', 'raw',
        '-e', 'signed',
        '-b', '16',
        '-c', '2',
        '-r', '44100',
      ]);
    }
    return new Promise((resolve, reject) => {
      const subprocess = spawn('sox', args, { stdio: 'inherit' });
      subprocess.on('exit', (code) => {
        if (code !== 0) {
          return reject(code);
        }
        resolve();
      });
    });
  }
}
