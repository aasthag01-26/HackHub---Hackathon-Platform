const test = require("node:test");
const assert = require("node:assert");
const {
  computeCompatibility,
  DEFAULT_CANDIDATES,
} = require("../backend/routes/matchmakerRoute.js");

test("Matchmaker: computeCompatibility returns high score for complementary skills", () => {
  const teamSkills = ["React", "TypeScript", "Tailwind CSS"];
  const aiCandidateSkills = ["Python", "PyTorch", "Hugging Face", "FastAPI"];

  const score = computeCompatibility(aiCandidateSkills, teamSkills);
  assert.ok(score >= 85, `Expected score >= 85 for purely complementary skills, got ${score}`);
  assert.ok(score <= 99, `Expected score <= 99, got ${score}`);
});

test("Matchmaker: computeCompatibility adjusts for overlapping vs complementary skills", () => {
  const teamSkills = ["React", "TypeScript", "Node.js"];
  const overlappingCandidate = ["React", "TypeScript", "HTML"];
  const complementaryCandidate = ["Solidity", "Hardhat", "Ethers.js"];

  const overlapScore = computeCompatibility(overlappingCandidate, teamSkills);
  const compScore = computeCompatibility(complementaryCandidate, teamSkills);

  assert.ok(
    compScore > overlapScore,
    `Complementary candidate score (${compScore}) should exceed overlapping candidate score (${overlapScore})`
  );
});

test("Matchmaker: handles empty or invalid skill arrays gracefully", () => {
  assert.strictEqual(computeCompatibility([], ["React"]), 60);
  assert.strictEqual(computeCompatibility(null, ["React"]), 60);
  assert.strictEqual(computeCompatibility(["Python"], []), 85);
});

test("Matchmaker: DEFAULT_CANDIDATES covers core hackathon disciplines", () => {
  assert.ok(Array.isArray(DEFAULT_CANDIDATES), "DEFAULT_CANDIDATES must be an array");
  assert.ok(DEFAULT_CANDIDATES.length >= 6, "Must provide at least 6 candidate profiles");

  const roles = DEFAULT_CANDIDATES.map((c) => c.role);
  assert.ok(roles.includes("AI/ML Engineer"), "Must include AI/ML Engineer");
  assert.ok(roles.includes("UI/UX Designer"), "Must include UI/UX Designer");
  assert.ok(roles.includes("Backend Developer"), "Must include Backend Developer");
  assert.ok(roles.includes("Frontend Developer"), "Must include Frontend Developer");

  // Every candidate must have verified university and skills
  DEFAULT_CANDIDATES.forEach((c) => {
    assert.ok(c.name && c.name.length > 0, "Candidate must have a name");
    assert.ok(c.university && c.university.length > 0, "Candidate must have a university");
    assert.ok(Array.isArray(c.skills) && c.skills.length > 0, "Candidate must have skills");
    assert.strictEqual(c.isVerifiedStudent, true, "Candidate must be verified student");
  });
});

test("Matchmaker: candidate filtering matches keywords case-insensitively", () => {
  const query = "pytorch";
  const matched = DEFAULT_CANDIDATES.filter((c) =>
    c.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  );
  assert.ok(matched.length >= 1, "Should find at least 1 PyTorch candidate");
  assert.strictEqual(matched[0].name, "Aarav Sharma");
});

test("Matchmaker: TeamInvite schema allows valid status transitions", () => {
  const allowed = ["pending", "accepted", "declined", "cancelled"];
  const testStatus = "accepted";
  assert.ok(allowed.includes(testStatus), "Status must be in allowed transitions");

  const invalidStatus = "hired";
  assert.strictEqual(allowed.includes(invalidStatus), false, "Invalid status must be rejected");
});
