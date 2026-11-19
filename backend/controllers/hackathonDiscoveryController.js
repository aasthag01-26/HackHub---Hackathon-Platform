const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon.js");
const User = require("../models/User.js");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getOrganizationFields = (query) => {
  if (mongoose.modelNames().includes("Organization")) {
    return query.populate("organization", "name website");
  }
  return query;
};

const formatHackathon = (hackathon) => {
  const event = hackathon.toObject ? hackathon.toObject() : hackathon;
  event.domain = event.domain || "";
  event.mode = ["online", "in_person", "hybrid"].includes(event.mode)
    ? event.mode
    : "";
  event.rules = Array.isArray(event.rules) ? event.rules : [];
  event.timeline = Array.isArray(event.timeline) ? event.timeline : [];
  event.prizes = Array.isArray(event.prizes) ? event.prizes : [];
  event.results = Array.isArray(event.results) ? event.results : [];
  event.resultsPublished = Boolean(event.resultsPublished);
  const organization =
    event.organization && typeof event.organization === "object"
      ? event.organization
      : null;
  event.organizationName =
    organization?.name || event.organizationName || "Hackathon Organizer";
  event.organizationWebsite =
    organization?.website || event.organizationWebsite || "";

  const now = new Date();
  event.status =
    event.stage === "completed" || new Date(event.endDate) < now
      ? "completed"
      : new Date(event.startDate) <= now
      ? "ongoing"
      : "upcoming";
  if (!event.resultsPublished) {
    event.results = [];
  }
  return event;
};

const createDiscoveryFilter = (queryParams) => {
  const {
    search = "",
    domain = "",
    mode = "",
    deadline = "",
    eligibility = "",
    status = "",
  } = queryParams;

  if (
    typeof search !== "string" ||
    search.length > 120 ||
    typeof domain !== "string" ||
    domain.length > 80 ||
    typeof eligibility !== "string" ||
    eligibility.length > 160 ||
    !["", "online", "in_person", "hybrid"].includes(mode) ||
    !["", "upcoming", "ongoing", "completed"].includes(status) ||
    !["", "open", "ending_soon", "closed"].includes(deadline)
  ) {
    return { error: "One or more hackathon filters are invalid" };
  }

  const filter = { published: true };
  const clauses = [];
  if (search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), "i");
    clauses.push({
      $or: [
        { title: pattern },
        { description: pattern },
        { domain: pattern },
        { eligibility: pattern },
        { organizationName: pattern },
      ],
    });
  }
  if (domain.trim()) {
    filter.domain = new RegExp(`^${escapeRegex(domain.trim())}$`, "i");
  }
  if (mode) {
    filter.mode = mode;
  }
  if (eligibility.trim()) {
    filter.eligibility = new RegExp(escapeRegex(eligibility.trim()), "i");
  }

  const now = new Date();
  if (status === "upcoming") {
    clauses.push({ startDate: { $gt: now }, stage: { $ne: "completed" } });
  } else if (status === "ongoing") {
    clauses.push({
      startDate: { $lte: now },
      endDate: { $gte: now },
      stage: { $ne: "completed" },
    });
  } else if (status === "completed") {
    clauses.push({
      $or: [{ endDate: { $lt: now } }, { stage: "completed" }],
    });
  }

  if (deadline === "open") {
    filter.registrationDeadline = { $gte: now };
  } else if (deadline === "closed") {
    filter.registrationDeadline = { $lt: now };
  } else if (deadline === "ending_soon") {
    filter.registrationDeadline = {
      $gte: now,
      $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    };
  }
  if (clauses.length) {
    filter.$and = clauses;
  }
  return { filter };
};

const listPublishedHackathons = async (req, res) => {
  try {
    const { filter, error } = createDiscoveryFilter(req.query);
    if (error) {
      return res.status(400).json({ message: error });
    }

    let query = Hackathon.find(filter)
      .select(
        "organization organizationName organizationWebsite title description domain mode eligibility rules registrationDeadline startDate endDate prizes timeline stage results resultsPublished"
      )
      .sort({ startDate: 1 })
      .limit(100);
    query = getOrganizationFields(query);
    const hackathons = await query.lean();
    res.status(200).json({ hackathons: hackathons.map(formatHackathon) });
  } catch (error) {
    console.error("LIST HACKATHONS ERROR:", error);
    res.status(500).json({ message: "Server error while discovering hackathons" });
  }
};

const getPublishedHackathon = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid hackathon ID" });
    }
    let query = Hackathon.findOne({
      _id: req.params.id,
      published: true,
    }).select(
      "organization organizationName organizationWebsite title description domain mode eligibility rules registrationDeadline startDate endDate prizes timeline stage results resultsPublished"
    );
    query = getOrganizationFields(query);
    const hackathon = await query.lean();
    if (!hackathon) {
      return res.status(404).json({ message: "Published hackathon not found" });
    }
    res.status(200).json({ hackathon: formatHackathon(hackathon) });
  } catch (error) {
    console.error("GET HACKATHON DETAILS ERROR:", error);
    res.status(500).json({ message: "Server error while fetching hackathon details" });
  }
};

const getBookmarkedHackathons = async (req, res) => {
  try {
    const { filter, error } = createDiscoveryFilter(req.query);
    if (error) {
      return res.status(400).json({ message: error });
    }
    const user = await User.findById(req.user._id).select(
      "bookmarkedHackathons"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    filter._id = { $in: user.bookmarkedHackathons };
    let query = Hackathon.find(filter).select(
      "organization organizationName organizationWebsite title description domain mode eligibility rules registrationDeadline startDate endDate prizes timeline stage results resultsPublished"
    );
    query = getOrganizationFields(query);
    const hackathons = await query.lean();
    const ordered = user.bookmarkedHackathons
      .map((id) =>
        hackathons.find((hackathon) => hackathon._id.equals(id))
      )
      .filter(Boolean);
    res.status(200).json({ hackathons: ordered.map(formatHackathon) });
  } catch (error) {
    console.error("GET BOOKMARKED HACKATHONS ERROR:", error);
    res.status(500).json({ message: "Server error while fetching bookmarks" });
  }
};

const bookmarkHackathon = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid hackathon ID" });
    }
    const hackathon = await Hackathon.findOne({
      _id: req.params.id,
      published: true,
    }).select("_id");
    if (!hackathon) {
      return res.status(404).json({ message: "Published hackathon not found" });
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { bookmarkedHackathons: hackathon._id },
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Hackathon bookmarked" });
  } catch (error) {
    console.error("BOOKMARK HACKATHON ERROR:", error);
    res.status(500).json({ message: "Server error while bookmarking hackathon" });
  }
};

const unbookmarkHackathon = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid hackathon ID" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { bookmarkedHackathons: req.params.id } },
      { new: true }
    ).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Hackathon removed from bookmarks" });
  } catch (error) {
    console.error("UNBOOKMARK HACKATHON ERROR:", error);
    res.status(500).json({ message: "Server error while removing bookmark" });
  }
};

module.exports = {
  createDiscoveryFilter,
  listPublishedHackathons,
  getPublishedHackathon,
  getBookmarkedHackathons,
  bookmarkHackathon,
  unbookmarkHackathon,
};
