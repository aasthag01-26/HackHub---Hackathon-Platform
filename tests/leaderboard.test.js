const test = require("node:test");
const assert = require("node:assert/strict");
const {
  recalculateRanks,
  requireJudgeOrOrganizer,
  DEFAULT_LEADERBOARD,
} = require("../backend/routes/leaderboardRoute.js");

test("Leaderboard rank recalculation orders teams by totalScore descending", () => {
  const dataset = [
    { teamName: "Alpha", scores: { totalScore: 75, technical: 20 } },
    { teamName: "Beta", scores: { totalScore: 95, technical: 24 } },
    { teamName: "Gamma", scores: { totalScore: 88, technical: 22 } },
  ];

  const ranked = recalculateRanks(dataset);
  assert.equal(ranked[0].teamName, "Beta");
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[0].medal, "gold");
  assert.equal(ranked[0].status, "winner");

  assert.equal(ranked[1].teamName, "Gamma");
  assert.equal(ranked[1].rank, 2);
  assert.equal(ranked[1].medal, "silver");

  assert.equal(ranked[2].teamName, "Alpha");
  assert.equal(ranked[2].rank, 3);
  assert.equal(ranked[2].medal, "bronze");
});

test("Leaderboard breaks ties using technical execution score", () => {
  const dataset = [
    { teamName: "TeamA", scores: { totalScore: 90, technical: 22 } },
    { teamName: "TeamB", scores: { totalScore: 90, technical: 25 } },
  ];

  const ranked = recalculateRanks(dataset);
  assert.equal(ranked[0].teamName, "TeamB");
  assert.equal(ranked[1].teamName, "TeamA");
});

test("Medals and statuses are assigned correctly across ranks", () => {
  const dataset = Array.from({ length: 8 }, (_, i) => ({
    teamName: `Team-${i + 1}`,
    scores: { totalScore: 100 - i * 5, technical: 20 },
  }));

  const ranked = recalculateRanks(dataset);
  assert.equal(ranked[0].medal, "gold");
  assert.equal(ranked[1].medal, "silver");
  assert.equal(ranked[2].medal, "bronze");
  assert.equal(ranked[3].status, "finalist");
  assert.equal(ranked[4].status, "finalist");
  assert.equal(ranked[5].status, "shortlisted");
});

test("Judge authorization middleware permits valid judge key", () => {
  const req = {
    headers: { "x-judge-key": "judge2026" },
  };
  let calledNext = false;
  const res = {
    status: () => res,
    json: () => {},
  };
  const next = () => {
    calledNext = true;
  };

  requireJudgeOrOrganizer(req, res, next);
  assert.equal(calledNext, true);
});

test("Judge authorization middleware rejects unauthorized request", () => {
  const req = {
    headers: {},
  };
  let statusSent = null;
  let jsonSent = null;
  const res = {
    status: (code) => {
      statusSent = code;
      return res;
    },
    json: (payload) => {
      jsonSent = payload;
    },
  };
  const next = () => {};

  requireJudgeOrOrganizer(req, res, next);
  assert.equal(statusSent, 403);
  assert.equal(jsonSent.success, false);
});

test("Default leaderboard dataset contains valid structure and criteria", () => {
  assert.ok(Array.isArray(DEFAULT_LEADERBOARD));
  assert.ok(DEFAULT_LEADERBOARD.length >= 5);
  for (const entry of DEFAULT_LEADERBOARD) {
    assert.ok(entry.teamName);
    assert.ok(entry.projectName);
    assert.ok(entry.scores.totalScore <= 100);
    assert.ok(entry.scores.totalScore >= 0);
  }
});
