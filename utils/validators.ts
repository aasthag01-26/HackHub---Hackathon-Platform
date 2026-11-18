/**
 * Production validation and utility helpers for HackHub
 */

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long." };
  }
  return { isValid: true };
}

export function calculateTimeRemaining(targetTimeMs: number, currentTimeMs: number = Date.now()): {
  isExpired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
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

export function calculateProgressPercentage(
  startTimeMs: number,
  endTimeMs: number,
  currentTimeMs: number = Date.now()
): number {
  const total = endTimeMs - startTimeMs;
  if (total <= 0) return 100;
  const elapsed = currentTimeMs - startTimeMs;
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

export function validateTaskAssignee(
  assigneeName: string,
  teamMembers: Array<{ name: string }>
): boolean {
  if (!assigneeName || !teamMembers || teamMembers.length === 0) return false;
  return teamMembers.some(
    (m) => m.name.trim().toLowerCase() === assigneeName.trim().toLowerCase()
  );
}

export function validateFileSecurity(
  fileName: string,
  fileSizeBytes: number,
  maxSizeBytes: number = 10 * 1024 * 1024,
  allowedExtensions: string[] = ["pdf", "png", "jpg", "jpeg", "zip", "txt", "md"]
): { isValid: boolean; error?: string } {
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
