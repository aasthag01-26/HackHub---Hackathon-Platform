const express = require("express");
const router = express.Router();
const OrganizerHackathon = require("../models/HackathonOrganizer");

const SEED_ORGANIZER_EVENTS = [
  {
    _id: "org-event-1",
    organizerId: "org-1",
    organizerName: "IEEE Student Branch",
    title: "IEEE Innovation Sprint 2026",
    tagline: "48-hour global challenge solving real-world engineering problems.",
    description: "Join international student teams to develop groundbreaking open source software and hardware solutions.",
    mode: "Virtual",
    prizePool: "$15,000",
    tracks: ["AI / ML", "Cybersecurity", "CleanTech", "Open Track"],
    rounds: [
      { roundNumber: 1, name: "Idea & Architecture Submission", deadline: new Date(Date.now() + 86400000 * 3), status: "Completed" },
      { roundNumber: 2, name: "MVP Build & Code Freeze", deadline: new Date(Date.now() + 86400000 * 5), status: "Active" },
      { roundNumber: 3, name: "Final Presentation & Pitch", deadline: new Date(Date.now() + 86400000 * 7), status: "Upcoming" },
    ],
    rubrics: [
      { criterion: "Technical Complexity", weight: 30, maxPoints: 30 },
      { criterion: "Innovation & Uniqueness", weight: 30, maxPoints: 30 },
      { criterion: "UI / UX Design", weight: 20, maxPoints: 20 },
      { criterion: "Pitch & Presentation", weight: 20, maxPoints: 20 },
    ],
    status: "Active",
    registeredTeamsCount: 28,
  },
];

// GET /api/organizer/hackathons - List all organizer hackathons
router.get("/hackathons", async (req, res) => {
  try {
    let events = await OrganizerHackathon.find().sort({ createdAt: -1 });
    if (events.length === 0) {
      events = await OrganizerHackathon.insertMany(SEED_ORGANIZER_EVENTS);
    }
    res.json(events);
  } catch (error) {
    console.error("Error fetching organizer events:", error);
    res.status(500).json({ message: "Server error fetching organizer events" });
  }
});

// POST /api/organizer/hackathons - Create a new hackathon event
router.post("/hackathons", async (req, res) => {
  try {
    const {
      organizerId = "org-current",
      organizerName = "Lead Organizer",
      title,
      tagline,
      description,
      mode,
      prizePool,
      tracks,
      rounds,
      rubrics,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newEvent = new OrganizerHackathon({
      organizerId,
      organizerName,
      title,
      tagline,
      description,
      mode: mode || "Virtual",
      prizePool: prizePool || "$5,000",
      tracks: tracks && tracks.length > 0 ? tracks : ["General"],
      rounds:
        rounds && rounds.length > 0
          ? rounds
          : [
              {
                roundNumber: 1,
                name: "Sprint Kickoff & Build",
                deadline: new Date(Date.now() + 86400000 * 3),
                status: "Active",
              },
            ],
      rubrics:
        rubrics && rubrics.length > 0
          ? rubrics
          : [
              { criterion: "Innovation", weight: 35, maxPoints: 35 },
              { criterion: "Execution", weight: 35, maxPoints: 35 },
              { criterion: "Design", weight: 30, maxPoints: 30 },
            ],
      status: "Published",
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating hackathon:", error);
    res.status(500).json({ message: "Server error creating hackathon" });
  }
});

// PUT /api/organizer/hackathons/:id - Update status or rounds
router.put("/hackathons/:id", async (req, res) => {
  try {
    const updated = await OrganizerHackathon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating hackathon:", error);
    res.status(500).json({ message: "Server error updating hackathon" });
  }
});

// DELETE /api/organizer/hackathons/:id - Delete hackathon
router.delete("/hackathons/:id", async (req, res) => {
  try {
    const deleted = await OrganizerHackathon.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    res.json({ message: "Hackathon deleted successfully" });
  } catch (error) {
    console.error("Error deleting hackathon:", error);
    res.status(500).json({ message: "Server error deleting hackathon" });
  }
});

module.exports = router;
