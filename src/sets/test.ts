import {resolve} from "path";
import Codec from "../Codec";

const codecsDir = resolve(__dirname, '..', '..', 'codecs');

function bin(name: string): string {
    return resolve(codecsDir, name);
}

export const codecs = [
    // new Codec(
    //     'nero 1.5.4.0',
    //     [bin('nero-1.5.4.0/neroAacEnc.exe'), '-br', '186000', '-if', '<input>', '-of', '<output>'],
    //     [bin('nero-1.5.4.0/neroAacDec.exe'), '-if', '<input>', '-of', '<output>'],
    //     {extension: '.mp4', raw: false, pipe: false},
    // ),
    // new Codec(
    //     'faac 1.29.9.2',
    //     [bin('faac-1.29.9.2-macos/faac'), '-v0', '-b', '186', '--overwrite', '-o', '<output>', '<input>'],
    //     [bin('faac-1.29.9.2-macos/faad'), '-q', '-f', '2', '-o', '<output>', '<input>'],
    //     {extension: '.m4a', raw: true, pipe: false},
    // ),
    // new Codec(
    //     'afconvert',
    //     ['afconvert', '--bitrate', '100000', '-q', '127', '-d', 'aac', '-f', 'm4af', '<input>', '<output>'],
    //     ['afconvert', '-f', 'WAVE', '-d', 'LEI16', '<input>', '<output>'],
    //     {extension: '.m4a', raw: false, pipe: false},
    // ),
    // new Codec(
    //     'Ogg Vorbis libvorbis 1.3.6 aoTuV b6.03',
    //     [bin('ogg-libvorbis-1.3.6-aotuv-b6.03-lancer-sse3/oggenc2.exe'), '-Q', '--bitrate', '100', '-o', '<output>', '<input>'],
    //     [bin('ogg-libvorbis-1.3.6-aotuv-b6.03-lancer-sse3/oggdec'), '-Q', '-o', '<output>', '<input>'],
    //     {extension: '.ogg', raw: false, pipe: false},
    // ),
    new Codec(
        'opus 1.3.1',
        [bin('opus-1.3.1-macos/opusenc'), '--quiet', '--bitrate', '100', '<input>', '<output>'],
        [bin('opus-1.3.1-macos/opusdec'), '--quiet', '<input>', '<output>'],
        {extension: '.opus', raw: true, pipe: false},
    ),
    new Codec(
        'LAME 3.100 (standard)',
        [bin('lame-3.100-macos/lame'), '--silent', '-b', '100', '<input>', '<output>'],
        [bin('lame-3.100-macos/lame'), '--silent', '--mp3input', '--decode', '-t', '<input>', '<output>'],
        {extension: '.mp3', raw: true, pipe: false},
    ),
    // new Codec(
    //     'Ogg Vorbis libvorbis 1.3.6',
    //     [bin('ogg-libvorbis-1.3.6-macos/oggenc'), '-Q', '--bitrate', '200', '-o', '<output>', '<input>'],
    //     [bin('ogg-libvorbis-1.3.6-macos/oggdec'), '-Q', '-o', '<output>', '<input>'],
    //     {extension: '.ogg', raw: false, pipe: false},
    // ),
    // new Codec(
    //     'LAME 3.100 (medium)',
    //     codecBinLame3100,
    //     ['--silent', '--preset', 'medium', '<input>', '<output>'],
    //     ['--silent', '--mp3input', '--decode', '-t', '<input>', '<output>'],
    //     {extension: '.mp3', raw: true, pipe: false},
    // ),
    // new Codec(
    //     'LAME 3.100 (extreme)',
    //     codecBinLame3100,
    //     ['--silent', '--preset', 'extreme', '<input>', '<output>'],
    //     ['--silent', '--mp3input', '--decode', '-t', '<input>', '<output>'],
    //     {extension: '.mp3', raw: true, pipe: false},
    // ),
    // new Codec(
    //     'LAME 3.100 (insane)',
    //     codecBinLame3100,
    //     ['--silent', '--preset', 'insane', '<input>', '<output>'],
    //     ['--silent', '--mp3input', '--decode', '-t', '<input>', '<output>'],
    //     {extension: '.mp3', raw: true, pipe: false},
    // ),
];
