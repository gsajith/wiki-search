// Offline pre-sort: read the raw Wikipedia titles file, sort it with the SAME
// comparator the runtime binary search uses, and write a sorted artifact the
// server loads at request time. Both the raw file and the artifact are
// gitignored — this script is the only committed part of the pipeline.
//
// Run with: npm run presort   (sets a larger heap; the array is ~7.2M strings)

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { compareByKey } from "../src/lib/comparator.mjs";

const INPUT = resolve(process.cwd(), "wikipedia-latest-titles.txt");
const OUTPUT = resolve(process.cwd(), "wikipedia-latest-titles.sorted.txt");

console.log(`Reading ${INPUT} ...`);
const raw = readFileSync(INPUT, "utf8");

// Split on newlines and drop blank lines (the file may end with a trailing \n).
const titles = raw.split("\n").filter((line) => line.length > 0);
console.log(`Read ${titles.length.toLocaleString()} titles. Sorting ...`);

titles.sort(compareByKey);

console.log(`Writing ${OUTPUT} ...`);
writeFileSync(OUTPUT, titles.join("\n") + "\n");
console.log("Done.");
