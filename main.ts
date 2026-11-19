// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: a GTA 6 launch-week meme with make.fun's
// ghost in the picture, posted on X from a public account with make.fun
// (a link or written out) and/or a tag of @makefunai and the play code
// in its text. This program hands the post in: it reads POST.json from the
// repository root, checks it names an X post address, and copies it to
// /output/POST.json, where the gate reads it. That is all it has to do.
//
// It also checks the meme picture the post carries is in the repository
// (assets/meme-x.png, a PNG) so a broken repo fails loudly here instead
// of silently handing in a post with no picture behind it.
//
// No network, no wall clock, no files outside the repository: the two
// runs of this program write the same bytes.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MEME_PATH = join(BOT_DIR, 'assets', 'meme-x.png');
const POST_PATH = join(BOT_DIR, 'POST.json');

// The meme picture: first eight bytes of a PNG file, fixed by the format.
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function fail(message: string): never {
  console.error(`gta6-meme-x-01: ${message}`);
  process.exit(1);
}

const meme = readFileSync(MEME_PATH);
if (meme.length < PNG_MAGIC.length) {
  fail('assets/meme-x.png is too short to be a PNG picture');
}
for (let i = 0; i < PNG_MAGIC.length; i++) {
  if (meme[i] !== PNG_MAGIC[i]) {
    fail('assets/meme-x.png is not a PNG picture');
  }
}

const postText = readFileSync(POST_PATH, 'utf8');
let post: unknown;
try {
  post = JSON.parse(postText);
} catch {
  fail('POST.json is not valid JSON');
}
if (typeof post !== 'object' || post === null || Array.isArray(post)) {
  fail('POST.json must be a JSON object naming the post');
}
const url = (post as { url?: unknown }).url;
if (typeof url !== 'string' || url.length === 0) {
  fail('POST.json must carry a "url" string with the X post address');
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(POST_PATH, join(OUTPUT_DIR, 'POST.json'));
