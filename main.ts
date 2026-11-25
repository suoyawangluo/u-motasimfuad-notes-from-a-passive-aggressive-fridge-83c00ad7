// Notes From a Passive-Aggressive Fridge — make.fun entry
// A smart fridge leaves one dry, petty, specific note for its owner.
// Gate: /output/entry.txt must be UTF-8 text, 1-200 characters,
// a single line, not only white space.
//
// The entry: the fridge counts every door opening with its sensors
// and resents the owner for opening it 47 times and taking nothing.
// The sting lands in the last sentence: "just move in."

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The note, in two beats: the sensor count, then the sting.
const SETUP = "I counted: you opened my door 47 times today and took nothing.";
const STING = "At this point, just move in.";

function buildEntry(): string {
  return `${SETUP} ${STING}`;
}

interface GateReport {
  ok: boolean;
  characters: number;
  lines: number;
}

function validateEntry(text: string): GateReport {
  const lines = text.split("\n").length;
  const ok =
    text.length >= 1 &&
    text.length <= 200 &&
    text.trim().length > 0 &&
    lines === 1;
  return { ok, characters: text.length, lines };
}

function verifyWritten(outPath: string, expected: string): string {
  const written = readFileSync(outPath, "utf8");
  if (written !== expected) {
    throw new Error(`read-back mismatch in ${outPath}`);
  }
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const entry = buildEntry();
  const report = validateEntry(entry);
  if (!report.ok) {
    throw new Error(
      `gate failed: ${report.characters} characters, ${report.lines} lines`,
    );
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, entry, "utf8");
  const sha256 = verifyWritten(outPath, entry);
  console.log(
    `gate passes: ${report.characters} code points, ${report.lines} line, sha256 ${sha256}`,
  );
  console.log(`wrote ${outPath}`);
  console.log(`verified: ${JSON.stringify(entry)}`);
}

main();
