import { resolve } from 'path';

const codecsDir = resolve(__dirname, '..', '..', 'codecs');

export default function binPath(name: string): string {
  return resolve(codecsDir, name);
}
