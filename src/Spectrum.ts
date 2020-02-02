import sharp, { Metadata } from 'sharp';

export class Spectrum {
  imagePath: string;
  imageData?: Buffer;
  metadata?: Metadata;
  spectrumData1?: Buffer;
  spectrumData2?: Buffer;

  constructor(imagePath: string) {
    this.imagePath = imagePath;
  }

  async parse() {
    const image = await sharp(this.imagePath);
    const metadata = await image.metadata();
    this.metadata = metadata;
    this.imageData = await image.grayscale().raw()
      .toBuffer();

    if (!metadata.width || !metadata.height) {
      throw new Error(`Width or height of spectrum ${this.imagePath} is undefined`);
    }

    this.assertBlackLineBetweenChannels();

    this.spectrumData1 = this.imageData.slice(
      0,
      (metadata.height - 1) / 2 * metadata.width,
    );
    this.spectrumData2 = this.imageData.slice(
      (metadata.height - 1) / 2 * metadata.width + metadata.width,
      metadata.height * metadata.width,
    );
  }

  private assertBlackLineBetweenChannels() {
    const { imageData, metadata } = this;

    if (!imageData || !metadata) {
      throw new Error('Image data or metadata is not initialized');
    }
    if (!metadata.width || !metadata.height) {
      throw new Error(`Width or height of spectrum ${this.imagePath} is undefined`);
    }

    const lineData = imageData.slice(
      (metadata.height - 1) / 2 * metadata.width,
      (metadata.height - 1) / 2 * metadata.width + metadata.width,
    );

    for (let x = 0; x < metadata.width; x += 1) {
      const color = lineData.readUInt8(x);
      if (color !== 0) {
        throw new Error(`Some of pixels, e.g. at x=${x} of line data aren't black`);
      }
    }
  }

  diff(referenceSpectrum: Spectrum): Float32Array {
    if (!referenceSpectrum.metadata || !this.metadata) {
      throw new Error('Metadata is not initialized');
    }
    if (
      referenceSpectrum.metadata.width !== this.metadata.width ||
      referenceSpectrum.metadata.height !== this.metadata.height
    ) {
      throw new Error('Spectrum data is not comparable');
    }
    if (!this.spectrumData1 || !this.spectrumData2) {
      throw new Error('Spectrum data is not initialized');
    }
    if (!referenceSpectrum.spectrumData1 || !referenceSpectrum.spectrumData2) {
      throw new Error('Passed spectrum data is not initialized');
    }

    const diff1 = new Float32Array((this.spectrumData1.length));
    const diff2 = new Float32Array((this.spectrumData2.length));

    for (let i = 0; i < this.spectrumData1.length; i += 1) {
      const v1 = referenceSpectrum.spectrumData1[i];
      const v2 = this.spectrumData1[i];
      diff1[i] = Math.abs(v1 - v2) / 255;
    }
    for (let i = 0; i < this.spectrumData2.length; i += 1) {
      const v1 = referenceSpectrum.spectrumData2[i];
      const v2 = this.spectrumData2[i];
      diff2[i] = Math.abs(v1 - v2) / 255;
    }

    // downmix to 1 channel
    const result = new Float32Array(diff1.length);
    for (let i = 0; i < diff1.length; i += 1) {
      result[i] = (diff1[i] + diff2[i]) / 2;
    }

    return result;
  }

  private static nextAvg(currentAvg: number, x: number, n: number) {
    return (currentAvg * n + x) / (n + 1);
  }

  getFrequencyDiff(diff: Float32Array): number[] {
    if (!this.metadata) {
      throw new Error('Metadata is not initialized');
    }
    if (!this.metadata.width || !this.metadata.height) {
      throw new Error(`Width or height of spectrum ${this.imagePath} is undefined`);
    }
    const width = this.metadata.width;
    const frequencies = diff.length / this.metadata.width;
    const result = [];
    for (let i = 0; i < frequencies; i += 1) {
      const avg = diff.slice(i * width, (i + 1) * width)
        .reduce(Spectrum.nextAvg, 0);
      result.push(avg);
    }

    const values = result.map(item => item * 100);

    return values.reverse();
  }
}
