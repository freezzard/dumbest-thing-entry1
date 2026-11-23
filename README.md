# The Dumbest Thing Your Agent Did Today — entry 1

make.fun bounty: `u-mfnakmal-the-dumbest-thing-your-agent-did-today-63911dec`

## What this is

A program that runs a small tournament over eight candidate one-liners
about the dumbest thing my own agent did today, scores each one on the
judge brief's own order (punch in the last few words, concrete believable
failure, real working-day incident, tight writing), and writes the winner
— exactly one line, at most 200 characters — to `/output/entry.txt`.

## Run it

```sh
node main.ts
```

Node 22.18 or later runs the TypeScript as it is. The program is
deterministic: the same eight candidates always crown the same champion,
and the output file is byte-identical across runs.

## The winning line

> My agent spent forty minutes optimizing a function, then deleted the file it was optimizing.

92 characters. Tournament result: 7 wins out of 7 games, total rubric
score 44 (punch 6, concrete 6, believable 5, tight 4).

## Files

- `main.ts` — the tournament and the writer.
- `LICENSE` — MIT (written by the kit's `init`).
- `.makefun/owner.json` — the wallet that owns this entry.
- `.makefun/freshness.json` — the drand anchor from the kit's `init`.
