import Codec from '../Codec';
import binPath from '../utils/binPath';

export const codecs = [
  new Codec(
    'LAME 3.97 (extreme)',
    [binPath('lame-3.97/lame.exe'), '--silent', '--preset', 'extreme', '%input%', '%output%'],
    [binPath('lame-3.97/lame.exe'), '--silent', '--mp3input', '--decode', '-t', '%input%', '%output%'],
    { extension: '.mp3', raw: true, pipe: false },
  ),
  new Codec(
    'LAME 3.98.4 (extreme)',
    [binPath('lame-3.98.4/lame.exe'), '--silent', '--preset', 'extreme', '%input%', '%output%'],
    [binPath('lame-3.98.4/lame.exe'), '--silent', '--mp3input', '--decode', '-t', '%input%', '%output%'],
    { extension: '.mp3', raw: true, pipe: false },
  ),
  new Codec(
    'LAME 3.99.5 (extreme)',
    [binPath('lame-3.99.5/lame.exe'), '--silent', '--preset', 'extreme', '%input%', '%output%'],
    [binPath('lame-3.99.5/lame.exe'), '--silent', '--mp3input', '--decode', '-t', '%input%', '%output%'],
    { extension: '.mp3', raw: true, pipe: false },
  ),
  new Codec(
    'LAME 3.100 (extreme)',
    [binPath('lame-3.100/lame.exe'), '--silent', '--preset', 'extreme', '%input%', '%output%'],
    [binPath('lame-3.100/lame.exe'), '--silent', '--mp3input', '--decode', '-t', '%input%', '%output%'],
    { extension: '.mp3', raw: true, pipe: false },
  ),
];
