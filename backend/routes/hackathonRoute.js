const express = require("express");
const {
  listPublishedHackathons,
  getPublishedHackathon,
  getBookmarkedHackathons,
  bookmarkHackathon,
  unbookmarkHackathon,
} = require("../controllers/hackathonDiscoveryController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/", listPublishedHackathons);
router.get("/bookmarks", protect, getBookmarkedHackathons);
router.get("/:id", getPublishedHackathon);
router.post("/:id/bookmark", protect, bookmarkHackathon);
router.delete("/:id/bookmark", protect, unbookmarkHackathon);

module.exports = router;
