import Codec from '../Codec';
import binPath from '../utils/binPath';

export const codecs = [
  new Codec(
    'afconvert',
    ['afconvert', '--bitrate', '186000', '-q', '127', '-d', 'aac', '-f', 'm4af', '<input>', '<output>'],
    ['afconvert', '-f', 'WAVE', '-d', 'LEI16', '<input>', '<output>'],
    { extension: '.m4a', raw: false, pipe: false },
  ),
  new Codec(
    'Ogg Vorbis libvorbis 1.3.6 aoTuV b6.03',
    [binPath('ogg-libvorbis-1.3.6-aotuv-b6.03-lancer-sse3/oggenc2.exe'), '-Q', '--bitrate', '200', '-o', '<output>', '<input>'],
    [binPath('ogg-libvorbis-1.3.6-aotuv-b6.03-lancer-sse3/oggdec'), '-Q', '-o', '<output>', '<input>'],
    { extension: '.ogg', raw: false, pipe: false },
  ),
  new Codec(
    'opus 1.3.1',
    [binPath('opus-1.3.1-macos/opusenc'), '--quiet', '--bitrate', '192', '<input>', '<output>'],
    [binPath('opus-1.3.1-macos/opusdec'), '--quiet', '<input>', '<output>'],
    { extension: '.opus', raw: true, pipe: false },
  ),
  new Codec(
    'LAME 3.100 (standard)',
    [binPath('lame-3.100-macos/lame'), '--silent', '--preset', 'standard', '<input>', '<output>'],
    [binPath('lame-3.100-macos/lame'), '--silent', '--mp3input', '--decode', '-t', '<input>', '<output>'],
    { extension: '.mp3', raw: true, pipe: false },
  ),
];
