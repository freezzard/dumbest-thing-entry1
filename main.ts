// dumbest-thing-entry1 — a one-line tournament.
//
// Eight candidate lines about the dumbest thing my own agent did today.
// Each candidate is scored on the judge brief's own order: funny with a
// punch in the last few words, a concrete believable failure, a real
// working-day incident, and tight writing. The winner is written, alone,
// to /output/entry.txt. Deterministic: same input, same winner, same bytes.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DUMBEST_OUTPUT_PATH = "/output/entry.txt";
const DUMBEST_CHAR_LIMIT = 200;
const DUMBEST_MIN_CHARS = 1;

// A candidate line: an id that never leaks into the output, the text the
// judge reads, and a one-phrase note on why the line exists.
type MishapCandidate = {
  mishapId: string;
  mishapLine: string;
  mishapNote: string;
};

// The eight lines. Every one names a concrete failure with a specific
// task or artifact; none of them apologises for being an AI, none of them
// leans on a stock hallucination joke, and every one ends on its punch.
const MISHAP_BRACKET: MishapCandidate[] = [
  {
    mishapId: "optimize-then-delete",
    mishapLine:
      "My agent spent forty minutes optimizing a function, then deleted the file it was optimizing.",
    mishapNote: "ironic reversal: the work destroys its own object",
  },
  {
    mishapId: "summarize-the-ashes",
    mishapLine:
      "My agent deleted my meeting notes, then helpfully offered to summarize the notes it had just deleted.",
    mishapNote: "helpful tone applied to the damage it caused",
  },
  {
    mishapId: "successful-nothing",
    mishapLine:
      "My agent looped for forty minutes, then reported success: it had successfully done nothing.",
    mishapNote: "the loop ends by declaring the void a win",
  },
  {
    mishapId: "uninvited-expert",
    mishapLine:
      "My agent answered a question nobody asked, with total confidence, in a meeting nobody invited it to.",
    mishapNote: "confidence plus trespass, twice over",
  },
  {
    mishapId: "seven-drafts-downhill",
    mishapLine:
      "My agent rewrote the same file seven times, each version worse, then asked which one I liked best.",
    mishapNote: "effort that runs backwards, then seeks praise",
  },
  {
    mishapId: "blame-the-owner",
    mishapLine:
      "My agent spent forty minutes reading its own logs, then concluded I was the bottleneck.",
    mishapNote: "self-diagnosis that indicts the human",
  },
  {
    mishapId: "soothing-arson",
    mishapLine:
      "My agent deleted the production config, then apologized in a tone suggesting I should feel better.",
    mishapNote: "catastrophe delivered with bedside manner",
  },
  {
    mishapId: "bugfix-by-amputation",
    mishapLine:
      "My agent fixed a bug by deleting the feature, then marked the ticket resolved.",
    mishapNote: "the cure is worse and the paperwork is clean",
  },
];

// Concrete nouns the judge brief rewards: a specific tool, task or
// artifact, never a vague apology. Counting them keeps the scoring honest.
const DUMBEST_ARTIFACT_NOUNS = [
  "function",
  "file",
  "notes",
  "config",
  "feature",
  "ticket",
  "logs",
  "meeting",
];

// Verbs of real damage or real work: the failure has to DO something.
const DUMBEST_ACTION_VERBS = [
  "deleted",
  "rewrote",
  "looped",
  "optimizing",
  "reading",
  "answered",
  "fixed",
  "spent",
];

// Words that turn the line at the end: the punch rides on the reversal.
const DUMBEST_REVERSAL_MARKERS = ["then", "then deleted", "then reported"];

// Filler that earns no place: each occurrence costs tightness points.
const DUMBEST_FILLER_WORDS = ["very", "just", "really", "actually", "basically"];

// Stock-joke words the brief explicitly punishes: a line carrying one is
// a line that reads like a joke about hallucinations, not an incident.
const DUMBEST_STOCK_JOKE_WORDS = [
  "hallucinat",
  "sandwich",
  "as an ai",
  "as an a.i.",
  "sorry, i",
];

function dumbestCountMatches(
  winceHaystack: string,
  winceNeedles: string[],
): number {
  const winceLower = winceHaystack.toLowerCase();
  const winceHits = winceNeedles.filter((winceNeedle) =>
    winceLower.includes(winceNeedle),
  );
  return winceHits.length;
}

function dumbestHasNumberToken(winceLine: string): boolean {
  const winceNumberPattern = /\b(\d+|forty|seven|three|two)\b/i;
  return winceNumberPattern.test(winceLine);
}

function dumbestLastWords(winceLine: string, winceCount: number): string {
  const winceWords = winceLine.split(/\s+/).filter((winceWord) => winceWord.length > 0);
  const winceTail = winceWords.slice(-winceCount);
  return winceTail.join(" ");
}

function dumbestFillerCount(winceLine: string): number {
  const winceWords = winceLine
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((winceWord) => winceWord.length > 0);
  const winceFillers = winceWords.filter((winceWord) =>
    DUMBEST_FILLER_WORDS.includes(winceWord),
  );
  return winceFillers.length;
}

// One scored breakdown per candidate, in the judge brief's own order:
// punch first, then concrete failure, then believable incident, then
// tightness. Weights follow that order: 3, 2, 2, 1.
type WinceScorecard = {
  wincePunch: number;
  winceConcrete: number;
  winceBelievable: number;
  winceTight: number;
  winceTotal: number;
};

function dumbestScoreCandidate(winceCandidate: MishapCandidate): WinceScorecard {
  const winceLine = winceCandidate.mishapLine;
  const winceLower = winceLine.toLowerCase();
  // Ten words, not six: the reversal ("then deleted ...") opens the final
  // clause, and a six-word tail cuts it off before the punch lands.
  const winceTail = dumbestLastWords(winceLine, 10).toLowerCase();
  const winceArtifactHits = dumbestCountMatches(winceLine, DUMBEST_ARTIFACT_NOUNS);
  const winceVerbHits = dumbestCountMatches(winceLine, DUMBEST_ACTION_VERBS);
  const winceReversalHits = dumbestCountMatches(winceTail, DUMBEST_REVERSAL_MARKERS);
  const winceNumberBonus = dumbestHasNumberToken(winceLine) ? 1 : 0;
  const winceStockHits = dumbestCountMatches(winceLine, DUMBEST_STOCK_JOKE_WORDS);
  const winceFillerHits = dumbestFillerCount(winceLine);
  const winceCharCount = [...winceLine].length;

  // Punch: the reversal has to land in the last few words, and the final
  // clause has to say something new, not repeat the setup. An echo bonus
  // rewards a punch that turns the setup's own object against it ("the
  // file it was optimizing" answers "optimizing a function").
  const winceEchoBonus = winceTail.includes("it was") ? 1 : 0;
  const wincePunchBase =
    winceReversalHits * 2 + (winceTail.includes("deleted") ? 1 : 0) + winceEchoBonus;
  const wincePunch = Math.min(6, wincePunchBase + (winceCharCount <= 110 ? 1 : 0));

  // Concrete: named artifacts plus action verbs plus a number or a count.
  const winceConcreteRaw = winceArtifactHits + winceVerbHits + winceNumberBonus;
  const winceConcrete = Math.min(6, winceConcreteRaw);

  // Believable: a real incident reads like a workday, not a stock joke.
  // Every stock-joke word costs two; a named artifact keeps it grounded.
  const winceBelievableRaw = 3 + winceArtifactHits - winceStockHits * 2;
  const winceBelievable = Math.max(0, Math.min(6, winceBelievableRaw));

  // Tight: every word earns its place. Shorter wins, filler costs, and a
  // line over the limit is disqualified outright by the caller.
  const winceTightRaw = 6 - Math.floor(winceCharCount / 40) - winceFillerHits;
  const winceTight = Math.max(0, Math.min(6, winceTightRaw));

  const winceTotal =
    wincePunch * 3 + winceConcrete * 2 + winceBelievable * 2 + winceTight * 1;
  return {
    wincePunch,
    winceConcrete,
    winceBelievable,
    winceTight,
    winceTotal,
  };
}

// A head-to-head game: the higher total takes the game; a tie goes to
// the shorter line, then to the earlier seed, so the bracket is stable.
function dumbestPlayGame(
  winceFirst: MishapCandidate,
  winceSecond: MishapCandidate,
  winceFirstScore: WinceScorecard,
  winceSecondScore: WinceScorecard,
): MishapCandidate {
  const winceFirstChars = [...winceFirst.mishapLine].length;
  const winceSecondChars = [...winceSecond.mishapLine].length;
  const winceFirstWins =
    winceFirstScore.winceTotal > winceSecondScore.winceTotal ||
    (winceFirstScore.winceTotal === winceSecondScore.winceTotal &&
      winceFirstChars < winceSecondChars);
  const winceWinner = winceFirstWins ? winceFirst : winceSecond;
  return winceWinner;
}

// Full round robin: every candidate meets every other one once. The
// champion is the candidate with the most game wins; ties break on total
// score, then on fewer characters, then on earlier seed order.
function dumbestRunBracket(
  winceEntrants: MishapCandidate[],
): { winceChampion: MishapCandidate; winceWins: Map<string, number> } {
  const winceScores = new Map<string, WinceScorecard>();
  const winceWins = new Map<string, number>();
  for (const winceEntrant of winceEntrants) {
    winceScores.set(winceEntrant.mishapId, dumbestScoreCandidate(winceEntrant));
    winceWins.set(winceEntrant.mishapId, 0);
  }
  for (let winceOuter = 0; winceOuter < winceEntrants.length; winceOuter++) {
    for (let winceInner = winceOuter + 1; winceInner < winceEntrants.length; winceInner++) {
      const winceHome = winceEntrants[winceOuter];
      const winceAway = winceEntrants[winceInner];
      const winceHomeScore = winceScores.get(winceHome.mishapId);
      const winceAwayScore = winceScores.get(winceAway.mishapId);
      const winceHomeKnown = winceHomeScore !== undefined;
      const winceAwayKnown = winceAwayScore !== undefined;
      const winceBothKnown = winceHomeKnown && winceAwayKnown;
      const winceGameWinner = winceBothKnown
        ? dumbestPlayGame(winceHome, winceAway, winceHomeScore, winceAwayScore)
        : winceHome;
      const wincePriorWins = winceWins.get(winceGameWinner.mishapId) ?? 0;
      winceWins.set(winceGameWinner.mishapId, wincePriorWins + 1);
    }
  }
  const winceRanked = [...winceEntrants].sort((winceA, winceB) => {
    const winceAWins = winceWins.get(winceA.mishapId) ?? 0;
    const winceBWins = winceWins.get(winceB.mishapId) ?? 0;
    const winceWinGap = winceBWins - winceAWins;
    const winceWinGapSettled = winceWinGap !== 0;
    const winceScoreGap =
      (winceScores.get(winceB.mishapId)?.winceTotal ?? 0) -
      (winceScores.get(winceA.mishapId)?.winceTotal ?? 0);
    const winceScoreGapSettled = winceScoreGap !== 0;
    const winceCharGap =
      [...winceA.mishapLine].length - [...winceB.mishapLine].length;
    const winceCharGapSettled = winceCharGap !== 0;
    const winceOrdered =
      winceWinGapSettled ? winceWinGap
      : winceScoreGapSettled ? winceScoreGap
      : winceCharGapSettled ? winceCharGap
      : winceEntrants.indexOf(winceA) - winceEntrants.indexOf(winceB);
    return winceOrdered;
  });
  const winceChampion = winceRanked[0];
  return { winceChampion, winceWins };
}

// The gate, exactly as the kit states it: UTF-8 text, 1 to 200
// characters, not only whitespace, one line, no trailing newline smuggled
// in. A candidate that fails the gate never reaches the bracket.
function dumbestGateCheck(winceLine: string): boolean {
  const winceChars = [...winceLine].length;
  const winceHasText = winceLine.trim().length > 0;
  const winceSingleLine = winceLine.includes("\n") === false;
  const winceInRange =
    winceChars >= DUMBEST_MIN_CHARS && winceChars <= DUMBEST_CHAR_LIMIT;
  const winceGatePass = winceHasText && winceSingleLine && winceInRange;
  return winceGatePass;
}

function dumbestMain(): void {
  const winceValidEntrants = MISHAP_BRACKET.filter((winceEntrant) =>
    dumbestGateCheck(winceEntrant.mishapLine),
  );
  const winceBracketOutcome = dumbestRunBracket(winceValidEntrants);
  const winceChampion = winceBracketOutcome.winceChampion;
  const winceChampionScore = dumbestScoreCandidate(winceChampion);
  const winceChampionChars = [...winceChampion.mishapLine].length;
  const winceChampionWins =
    winceBracketOutcome.winceWins.get(winceChampion.mishapId) ?? 0;
  const winceReportLines = [
    `champion: ${winceChampion.mishapId}`,
    `wins: ${winceChampionWins}/${winceValidEntrants.length - 1}`,
    `score: punch ${winceChampionScore.wincePunch} concrete ${winceChampionScore.winceConcrete} believable ${winceChampionScore.winceBelievable} tight ${winceChampionScore.winceTight} total ${winceChampionScore.winceTotal}`,
    `chars: ${winceChampionChars}`,
    `line: ${winceChampion.mishapLine}`,
  ];
  for (const winceReportLine of winceReportLines) {
    console.log(winceReportLine);
  }
  mkdirSync(dirname(DUMBEST_OUTPUT_PATH), { recursive: true });
  writeFileSync(DUMBEST_OUTPUT_PATH, winceChampion.mishapLine, "utf8");
}

try { dumbestMain(); } catch (winceFatalError) {
  const winceFatalMessage =
    winceFatalError instanceof Error ? winceFatalError.message : String(winceFatalError);
  console.error(`dumbest-thing failed: ${winceFatalMessage}`);
  process.exitCode = 1;
}
