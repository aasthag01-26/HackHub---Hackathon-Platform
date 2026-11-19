const express = require("express");
const router = express.Router();

const {
  createTeam,
  joinTeam,
  getMyTeam,
  updateTeamProfile,
  updateMemberRole,
  removeMember,
  regenerateInviteCode,
  leaveTeam,
} = require("../controllers/teamController.js");
const { protect } = require("../middleware/authMiddleware.js");

// Basic team lifecycle
router.route("/").post(protect, createTeam);
router.route("/join").post(protect, joinTeam);
router.route("/myteam").get(protect, getMyTeam);
router.route("/leave").post(protect, leaveTeam);

// Role-based team management (Leader only)
router.route("/profile").put(protect, updateTeamProfile);
router.route("/members/:targetUserId/role").put(protect, updateMemberRole);
router.route("/members/:targetUserId").delete(protect, removeMember);
router.route("/invite-code").post(protect, regenerateInviteCode);

module.exports = router;
