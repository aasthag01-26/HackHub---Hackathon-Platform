const express = require("express");
const {
  getMyParticipations,
  getMyInvitations,
  registerForHackathon,
  inviteStudents,
  acceptInvitation,
  updateProject,
  updateParticipationStatus,
} = require("../controllers/participationController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.use(protect);
router.get("/mine", getMyParticipations);
router.get("/invitations", getMyInvitations);
router.post("/register", registerForHackathon);
router.post("/invitations/accept", acceptInvitation);
router.post("/:id/invitations", inviteStudents);
router.patch("/:id/project", updateProject);
router.patch("/:id/status", updateParticipationStatus);

module.exports = router;
