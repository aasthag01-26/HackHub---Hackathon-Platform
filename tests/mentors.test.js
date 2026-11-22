const test = require("node:test");
const assert = require("node:assert/strict");
const {
  filterMentors,
  validateMentorPayload,
  validateFeedbackPayload,
  DEFAULT_MENTORS,
  DEFAULT_REQUESTS,
} = require("../backend/routes/mentorRoute.js");

test("filterMentors filters by domain accurately", () => {
  const result = filterMentors(DEFAULT_MENTORS, { domain: "Healthcare" });
  assert.ok(result.length > 0);
  for (const m of result) {
    assert.ok(m.domains.includes("Healthcare"));
  }
});

test("filterMentors matches search keyword across skills, company and name", () => {
  const bySkill = filterMentors(DEFAULT_MENTORS, { search: "PyTorch" });
  assert.equal(bySkill[0].name, "Dr. Alistair Vance");

  const byCompany = filterMentors(DEFAULT_MENTORS, { search: "Ethereum" });
  assert.equal(byCompany[0].name, "Elena Rostova");
});

test("filterMentors handles availability filtering", () => {
  const busy = filterMentors(DEFAULT_MENTORS, { availability: "busy" });
  assert.equal(busy.length, 1);
  assert.equal(busy[0].name, "Sophia Chen");
});

test("validateMentorPayload accepts valid mentor payload", () => {
  const valid = {
    name: "Dr. Grace Hopper",
    title: "Computer Scientist",
    contactEmail: "grace@navy.mil",
    domains: ["Cloud & DevOps"],
  };
  const res = validateMentorPayload(valid);
  assert.equal(res.valid, true);
});

test("validateMentorPayload rejects missing name or invalid email", () => {
  const invalidEmail = {
    name: "Ada Lovelace",
    title: "Mathematician",
    contactEmail: "not-an-email",
    domains: ["AI / ML"],
  };
  const res = validateMentorPayload(invalidEmail);
  assert.equal(res.valid, false);

  const missingName = {
    name: " ",
    title: "Engineer",
    contactEmail: "test@example.com",
    domains: ["AI / ML"],
  };
  const res2 = validateMentorPayload(missingName);
  assert.equal(res2.valid, false);
});

test("validateFeedbackPayload enforces content length and milestone", () => {
  const valid = {
    milestone: "MVP Demo & Code Quality",
    feedback: "High quality test coverage and low API response time.",
    rating: 5,
  };
  assert.equal(validateFeedbackPayload(valid).valid, true);

  const tooShort = {
    milestone: "MVP Demo & Code Quality",
    feedback: "Good.",
  };
  assert.equal(validateFeedbackPayload(tooShort).valid, false);
});
