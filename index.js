#!/usr/bin/env node

const readline = require('readline');
const { performance } = require('perf_hooks');
const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');
const dataPath = path.join(homedir, '.soku.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getLine = (function () {
    const getLineGen = (async function* () {
        for await (const line of rl) {
            yield line;
        }
    })();
    return async () => ((await getLineGen.next()).value);
})();

const saved = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

function calcAvg(arr) {
  return arr.reduce((acc, val) => acc + val, 0) / arr.length;
}

async function run_sum(count) {
  const times = [];

  let i = 0;
  for (let i = 0; i < count; i += 1) {
    const a = Math.floor(Math.random() * 900 + 100);
    const b = Math.floor(Math.random() * 900 + 100);
    const str = `${a} + ${b} = `;
    rl.setPrompt(str);
    rl.prompt();
    const t0 = performance.now();
    const res = await getLine();
    const tot = performance.now() - t0;

    if (parseInt(res, 10) === a + b) {
      times.push(tot);
    } else {
      console.log('no')
    }
  }
  const avg = calcAvg(times);

  console.log(`averaged ${avg}ms; ${times.length}/${count} ok`);
  if (saved.data.length) {
    const prevAvg = calcAvg(saved.data[saved.data.length - 1].values);
    console.log(`Previous average is ${prevAvg}`);
    if (prevAvg > avg) {
      console.log(`Improvement of ${prevAvg - avg}ms (${((prevAvg - avg) / prevAvg * 100).toFixed(2)}%)`);
    }
  }
  saved.data.push({ values: times });
  fs.writeFileSync(dataPath, JSON.stringify(saved));
  process.exit(0);
}

if (process.argv[2] === 'log') {
  saved.data.forEach((d) => {
    const avg = calcAvg(d.values);
    console.log(avg);
  });
} else {
  run_sum(10);
}
