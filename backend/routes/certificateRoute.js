const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const SEED_CERTIFICATES = [
  {
    certificateId: "HH-2026-WINNER-8842",
    recipientName: "SriRam Kunamsetty",
    role: "Full-Stack Lead",
    teamName: "Zenith Squad",
    eventName: "IEEE Innovation Sprint 2026",
    awardTitle: "1st Place Grand Winner & Best Architecture",
    issuedAt: "November 19, 2026",
    issuer: "HackHub Organizing Committee & IEEE",
    verificationHash: "0x8fa3e921d7b4198c47b59e001c23a54b9f1a238e",
  },
  {
    certificateId: "HH-2026-PART-3190",
    recipientName: "Alex Rivers",
    role: "Frontend Engineer",
    teamName: "Zenith Squad",
    eventName: "IEEE Innovation Sprint 2026",
    awardTitle: "Certificate of Outstanding Participation",
    issuedAt: "November 19, 2026",
    issuer: "HackHub Organizing Committee",
    verificationHash: "0x41ab99283f51082c9f8021d98bc61109aef88231",
  },
];

// In-memory / Mongo fallback map
const certStore = new Map();
SEED_CERTIFICATES.forEach((c) => certStore.set(c.certificateId, c));

// GET /api/certificates/verify/:certId - verify certificate authenticity
router.get("/verify/:certId", (req, res) => {
  const { certId } = req.params;
  const cert = certStore.get(certId);

  if (!cert) {
    return res.status(404).json({
      valid: false,
      message: "Certificate not found or verification hash invalid",
    });
  }

  res.json({
    valid: true,
    certificate: cert,
    verifiedAt: new Date().toISOString(),
  });
});

// GET /api/certificates/user/:userId - list certificates
router.get("/user/:userId", (req, res) => {
  res.json(Array.from(certStore.values()));
});

// POST /api/certificates/generate - issue certificate
router.post("/generate", (req, res) => {
  const { recipientName, role, teamName, eventName, awardTitle } = req.body;
  if (!recipientName || !eventName) {
    return res.status(400).json({ message: "Recipient name and event name are required" });
  }

  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  const certId = `HH-2026-${randomHex}`;
  const verificationHash = "0x" + crypto.createHash("sha256").update(certId + recipientName).digest("hex").slice(0, 40);

  const newCert = {
    certificateId: certId,
    recipientName,
    role: role || "Participant",
    teamName: teamName || "Solo Hacker",
    eventName,
    awardTitle: awardTitle || "Certificate of Accomplishment",
    issuedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    issuer: "HackHub Organizing Committee & IEEE",
    verificationHash,
  };

  certStore.set(certId, newCert);
  res.status(201).json(newCert);
});

module.exports = router;
