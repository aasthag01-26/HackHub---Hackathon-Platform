const test = require("node:test");
const assert = require("node:assert/strict");

// Pure JS implementations matching utils/validators.ts for automated CLI testing
function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long." };
  }
  return { isValid: true };
}

function calculateTimeRemaining(targetTimeMs, currentTimeMs = Date.now()) {
  const distance = targetTimeMs - currentTimeMs;
  if (distance <= 0) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return { isExpired: false, days, hours, minutes, seconds };
}

function calculateProgressPercentage(startTimeMs, endTimeMs, currentTimeMs = Date.now()) {
  const total = endTimeMs - startTimeMs;
  if (total <= 0) return 100;
  const elapsed = currentTimeMs - startTimeMs;
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

function validateTaskAssignee(assigneeName, teamMembers) {
  if (!assigneeName || !teamMembers || teamMembers.length === 0) return false;
  return teamMembers.some(
    (m) => m.name.trim().toLowerCase() === assigneeName.trim().toLowerCase()
  );
}

function validateFileSecurity(fileName, fileSizeBytes, maxSizeBytes = 10 * 1024 * 1024, allowedExtensions = ["pdf", "png", "jpg", "jpeg", "zip", "txt", "md"]) {
  if (!fileName || fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return { isValid: false, error: "Invalid filename or path traversal detected." };
  }
  if (fileSizeBytes > maxSizeBytes) {
    return { isValid: false, error: `File exceeds maximum size limit of ${maxSizeBytes / (1024 * 1024)}MB.` };
  }
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    return { isValid: false, error: `File type .${ext || "unknown"} is not allowed.` };
  }
  return { isValid: true };
}

// ----------------- Test Suite -----------------

test("Email Validator rejects invalid email patterns", () => {
  assert.equal(validateEmail("invalid-email"), false);
  assert.equal(validateEmail("user@"), false);
  assert.equal(validateEmail("@example.com"), false);
  assert.equal(validateEmail("user@domain"), false);
  assert.equal(validateEmail(""), false);
  assert.equal(validateEmail(null), false);
});

test("Email Validator accepts RFC standard emails", () => {
  assert.equal(validateEmail("sanjai@example.com"), true);
  assert.equal(validateEmail("lead.dev@sub.domain.org"), true);
});

test("Password Validator enforces 6-character minimum", () => {
  assert.equal(validatePassword("12345").isValid, false);
  assert.equal(validatePassword("").isValid, false);
  assert.equal(validatePassword("123456").isValid, true);
  assert.equal(validatePassword("securePassword!2026").isValid, true);
});

test("Countdown Timer correctly computes days, hours, minutes, seconds", () => {
  const current = 1000000;
  // 1 day + 2 hours + 3 mins + 4 secs = 86400 + 7200 + 180 + 4 = 93784 seconds = 93784000 ms
  const target = current + 93784000;
  const res = calculateTimeRemaining(target, current);
  assert.equal(res.isExpired, false);
  assert.equal(res.days, 1);
  assert.equal(res.hours, 2);
  assert.equal(res.minutes, 3);
  assert.equal(res.seconds, 4);
});

test("Countdown Timer flags expired targets", () => {
  const current = 1000000;
  const res = calculateTimeRemaining(current - 500, current);
  assert.equal(res.isExpired, true);
  assert.equal(res.days, 0);
});

test("Progress calculation correctly clamps between 0% and 100%", () => {
  assert.equal(calculateProgressPercentage(0, 100, 50), 50);
  assert.equal(calculateProgressPercentage(0, 100, -10), 0);
  assert.equal(calculateProgressPercentage(0, 100, 150), 100);
});

test("Task Assignment Validation enforces team membership", () => {
  const members = [{ name: "Sanjai Gopal" }, { name: "Alice Developer" }];
  assert.equal(validateTaskAssignee("Sanjai Gopal", members), true);
  assert.equal(validateTaskAssignee("alice developer", members), true);
  assert.equal(validateTaskAssignee("Rogue User", members), false);
  assert.equal(validateTaskAssignee("", members), false);
});

test("File Upload Security detects path traversal and bad extensions", () => {
  assert.equal(validateFileSecurity("../etc/passwd", 100).isValid, false);
  assert.equal(validateFileSecurity("malicious.exe", 100).isValid, false);
  assert.equal(validateFileSecurity("script.sh", 100).isValid, false);
  assert.equal(validateFileSecurity("huge.pdf", 15 * 1024 * 1024).isValid, false);
  assert.equal(validateFileSecurity("diagram.png", 500 * 1024).isValid, true);
  assert.equal(validateFileSecurity("pitch-deck.pdf", 2 * 1024 * 1024).isValid, true);
});
