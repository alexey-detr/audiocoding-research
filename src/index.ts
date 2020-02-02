import { resolve } from 'path';
import { Sox } from './sox';
import { Spectrum } from './spectrum';
import { TestPack } from './TestPack';
import { codecs } from './sets/test';

const referenceWavPath = resolve(__dirname, '..', 'virus.wav');
const referenceSpectrumImagePath = resolve(__dirname, '..', 'spectrogram.png');

(async () => {
  const sox = new Sox(referenceWavPath);
  await sox.buildSpectrumImage(referenceSpectrumImagePath, false);

  const referenceSpectrum = new Spectrum(referenceSpectrumImagePath);
  await referenceSpectrum.parse();

  const testPack = new TestPack(referenceWavPath, referenceSpectrum);
  for (const codec of codecs) {
    testPack.addCodec(codec);
  }

  await testPack.run();
})();
