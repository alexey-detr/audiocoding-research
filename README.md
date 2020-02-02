# Audio codecs spectrogram research tool

## Requirements

At the moment works on MacOS only.

- Node.js and NPM
- [Sox](http://sox.sourceforge.net/)
- Wine for Windows binaries

## Usage

Clone the repository.

Run `npm i` in the repository directory.

All paths described below are relative to the repository directory.

Choose the reference WAV file and put it to `reference.wav`

Choose codecs you want to test. Put their binaries in the codecs dir e.g. to `codecs/lame-3.100/lame.exe`

Prepare `sets/test.ts` file. Codec should be defined in the following format:

```typescript
new Codec(
  'LAME 3.100 (extreme)',
  [binPath('lame-3.100/lame.exe'), '--silent', '--preset', 'extreme', '%input%', '%output%'],
  [binPath('lame-3.100/lame.exe'), '--silent', '--mp3input', '--decode', '-t', '%input%', '%output%'],
  { extension: '.mp3', raw: true, pipe: false },
)
```

When everything is ready, run the test tool with `npm start` and wait until it finish.

## Results

The results will be in the `results` directory under the subdirectory which is corresponding to the single run, e.g. `results/2020-02-02-20-20-18`. You'll find three most important files there:

### diff_stats.csv

Columns:

- Frequency, Hz
- Codec, % of difference comparing to the reference file

### size_stats.csv

Columns:

- Codec name
- Size, bytes

### time_stats.csv

Columns:

- Codec name
- Coding time, milliseconds
- Decoding time, milliseconds
