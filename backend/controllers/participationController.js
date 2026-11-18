const crypto = require("crypto");
const mongoose = require("mongoose");
const Participation = require("../models/Participation.js");
const Team = require("../models/Team.js");
const User = require("../models/User.js");

const createInvitations = (emails, invitedBy) =>
  emails.map((email) => ({
    email: email.trim().toLowerCase(),
    token: crypto.randomBytes(24).toString("hex"),
    invitedBy,
  }));

const normalizeHackathon = (name) =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

const isMember = (participation, userId) =>
  participation.members.some((member) => member.user.equals(userId));

const getMyParticipations = async (req, res) => {
  try {
    const participations = await Participation.find({
      "members.user": req.user._id,
    })
      .populate("members.user", "name email")
      .lean();

    const result = participations.map((participation) => {
      if (!participation.createdBy.equals(req.user._id)) {
        participation.invitations = [];
      }
      return participation;
    });

    res.status(200).json({ participations: result });
  } catch (error) {
    console.error("GET PARTICIPATIONS ERROR:", error);
    res.status(500).json({ message: "Server error while fetching registrations" });
  }
};

const getMyInvitations = async (req, res) => {
  try {
    const participations = await Participation.find({
      invitations: {
        $elemMatch: { email: req.user.email, status: "pending" },
      },
    })
      .select("hackathonName teamName invitations")
      .lean();

    const invitations = participations.flatMap((participation) =>
      participation.invitations
        .filter(
          (invitation) =>
            invitation.email === req.user.email &&
            invitation.status === "pending"
        )
        .map((invitation) => ({
          token: invitation.token,
          hackathonName: participation.hackathonName,
          teamName: participation.teamName,
        }))
    );

    res.status(200).json({ invitations });
  } catch (error) {
    console.error("GET PARTICIPATION INVITATIONS ERROR:", error);
    res.status(500).json({ message: "Server error while fetching invitations" });
  }
};

const registerForHackathon = async (req, res) => {
  try {
    const { hackathonName, mode, teamName, existingTeamId, inviteEmails = [] } =
      req.body;

    if (
      typeof hackathonName !== "string" ||
      !hackathonName.trim() ||
      hackathonName.trim().length > 120
    ) {
      return res.status(400).json({ message: "Enter a valid hackathon name" });
    }
    if (!["individual", "team"].includes(mode)) {
      return res.status(400).json({ message: "Choose individual or team registration" });
    }
    if (!Array.isArray(inviteEmails) || inviteEmails.length > 10) {
      return res.status(400).json({ message: "Invite up to 10 students at a time" });
    }
    if (mode === "individual" && inviteEmails.length) {
      return res.status(400).json({ message: "Individual registrations cannot invite teammates" });
    }

    const normalizedEmails = inviteEmails.map((email) =>
      typeof email === "string" ? email.trim().toLowerCase() : ""
    );
    if (
      normalizedEmails.some(
        (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
    ) {
      return res.status(400).json({ message: "Enter valid email addresses for invitations" });
    }
    if (new Set(normalizedEmails).size !== normalizedEmails.length) {
      return res.status(400).json({ message: "Invitation email addresses must be unique" });
    }

    let members = [{ user: req.user._id, role: "leader" }];
    let registrationTeamName;
    let existingTeam;

    if (mode === "team") {
      if (existingTeamId) {
        if (!mongoose.isValidObjectId(existingTeamId)) {
          return res.status(400).json({ message: "Invalid existing team" });
        }
        existingTeam = await Team.findById(existingTeamId).populate(
          "members.user",
          "email"
        );
        if (!existingTeam) {
          return res.status(404).json({ message: "Existing team not found" });
        }
        const leader = existingTeam.members.find(
          (member) =>
            member.user &&
            member.user._id.equals(req.user._id) &&
            member.role === "leader"
        );
        if (!leader) {
          return res.status(403).json({ message: "Only the existing team leader can register the team" });
        }
        members = existingTeam.members
          .filter((member) => member.user)
          .map((member) => ({
            user: member.user._id,
            role: member.role === "leader" ? "leader" : "member",
          }));
        registrationTeamName = existingTeam.name;
      } else {
        if (typeof teamName !== "string" || !teamName.trim() || teamName.trim().length > 80) {
          return res.status(400).json({ message: "Enter a valid team name" });
        }
        registrationTeamName = teamName.trim();
      }
    }

    const memberIds = [...new Map(members.map((member) => [
      member.user.toString(),
      member,
    ])).values()];
    if (memberIds.length !== members.length) {
      return res.status(400).json({ message: "The existing team has duplicate members" });
    }

    const currentMembers = await User.find({
      _id: { $in: memberIds.map((member) => member.user) },
    }).select("email");
    const currentMemberEmails = new Set(
      currentMembers.map((member) => member.email)
    );
    if (normalizedEmails.some((email) => currentMemberEmails.has(email))) {
      return res.status(400).json({
        message: "A current team member cannot be invited again",
      });
    }

    const hackathonKey = normalizeHackathon(hackathonName);
    const existingRegistration = await Participation.findOne({
      hackathonKey,
      "members.user": { $in: memberIds.map((member) => member.user) },
    });
    if (existingRegistration) {
      return res.status(409).json({
        message: "You or a teammate is already registered for this hackathon",
      });
    }

    const invitations = createInvitations(normalizedEmails, req.user._id);
    const participation = await Participation.create({
      hackathonName: hackathonName.trim().replace(/\s+/g, " "),
      hackathonKey,
      mode,
      teamName: registrationTeamName,
      existingTeam: existingTeam?._id,
      createdBy: req.user._id,
      members: memberIds,
      invitations,
    });

    res.status(201).json({
      message: "Hackathon registration created",
      participation,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You or a teammate is already registered for this hackathon",
      });
    }
    console.error("REGISTER FOR HACKATHON ERROR:", error);
    res.status(500).json({ message: "Server error while registering for the hackathon" });
  }
};

const inviteStudents = async (req, res) => {
  try {
    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length < 1 || emails.length > 10) {
      return res.status(400).json({ message: "Invite between 1 and 10 students" });
    }
    const normalizedEmails = emails.map((email) =>
      typeof email === "string" ? email.trim().toLowerCase() : ""
    );
    if (
      normalizedEmails.some(
        (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) ||
      new Set(normalizedEmails).size !== normalizedEmails.length
    ) {
      return res.status(400).json({ message: "Enter unique, valid email addresses" });
    }

    const participation = await Participation.findById(req.params.id);
    if (!participation) {
      return res.status(404).json({ message: "Registration not found" });
    }
    if (!participation.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the team organizer can invite students" });
    }
    if (participation.mode !== "team") {
      return res.status(400).json({ message: "Individual registrations cannot invite teammates" });
    }

    const memberUsers = await User.find({
      _id: { $in: participation.members.map((member) => member.user) },
    }).select("email");
    const memberEmails = new Set(memberUsers.map((user) => user.email));
    const pendingEmails = new Set(
      participation.invitations
        .filter((invitation) => invitation.status === "pending")
        .map((invitation) => invitation.email)
    );
    if (
      normalizedEmails.some(
        (email) => memberEmails.has(email) || pendingEmails.has(email)
      )
    ) {
      return res.status(409).json({ message: "A student is already a team member or has a pending invitation" });
    }
    const invitedUsers = await User.find({
      email: { $in: normalizedEmails },
    }).select("_id");
    if (invitedUsers.length) {
      const alreadyRegistered = await Participation.findOne({
        hackathonKey: participation.hackathonKey,
        "members.user": { $in: invitedUsers.map((user) => user._id) },
      });
      if (alreadyRegistered) {
        return res.status(409).json({
          message: "A student is already registered for this hackathon",
        });
      }
    }

    participation.invitations.push(
      ...createInvitations(normalizedEmails, req.user._id)
    );
    await participation.save();

    res.status(201).json({
      message: "Invitations created",
      invitations: participation.invitations
        .filter((invitation) => normalizedEmails.includes(invitation.email))
        .map((invitation) => ({
          email: invitation.email,
          token: invitation.token,
        })),
    });
  } catch (error) {
    console.error("INVITE STUDENTS ERROR:", error);
    res.status(500).json({ message: "Server error while inviting students" });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;
    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({ message: "Invitation token is required" });
    }

    const participation = await Participation.findOne({
      invitations: {
        $elemMatch: { token: token.trim(), status: "pending" },
      },
    });
    if (!participation) {
      return res.status(404).json({ message: "Invitation is invalid or has already been used" });
    }
    const invitation = participation.invitations.find(
      (item) => item.token === token.trim() && item.status === "pending"
    );
    if (invitation.email !== req.user.email) {
      return res.status(403).json({ message: "This invitation was sent to a different email address" });
    }
    if (isMember(participation, req.user._id)) {
      return res.status(409).json({ message: "You are already registered for this hackathon" });
    }
    const existingRegistration = await Participation.findOne({
      hackathonKey: participation.hackathonKey,
      "members.user": req.user._id,
    });
    if (existingRegistration) {
      return res.status(409).json({ message: "You are already registered for this hackathon" });
    }

    participation.members.push({ user: req.user._id, role: "member" });
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await participation.save();

    res.status(200).json({
      message: "Invitation accepted",
      participation,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You are already registered for this hackathon" });
    }
    console.error("ACCEPT PARTICIPATION INVITATION ERROR:", error);
    res.status(500).json({ message: "Server error while accepting invitation" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, repositoryUrl, demoUrl } = req.body;
    if (
      [title, description, repositoryUrl, demoUrl].some(
        (value) => value !== undefined && typeof value !== "string"
      )
    ) {
      return res.status(400).json({ message: "Project details must be text" });
    }
    if (
      (title && title.length > 120) ||
      (description && description.length > 3000) ||
      (repositoryUrl && repositoryUrl.length > 500) ||
      (demoUrl && demoUrl.length > 500)
    ) {
      return res.status(400).json({ message: "Project details exceed the allowed length" });
    }
    for (const field of ["repositoryUrl", "demoUrl"]) {
      const value = req.body[field];
      if (value) {
        try {
          const parsedUrl = new URL(value);
          if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({ message: "Project links must use http or https" });
          }
        } catch {
          return res.status(400).json({ message: "Enter valid project URLs" });
        }
      }
    }
    const participation = await Participation.findById(req.params.id);
    if (!participation) {
      return res.status(404).json({ message: "Registration not found" });
    }
    if (!isMember(participation, req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this registration" });
    }

    ["title", "description", "repositoryUrl", "demoUrl"].forEach((field) => {
      if (req.body[field] !== undefined) {
        participation.project[field] = req.body[field].trim();
      }
    });
    await participation.save();
    res.status(200).json({ message: "Project details saved", participation });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);
    res.status(500).json({ message: "Server error while saving project details" });
  }
};

const updateParticipationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["registered", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Choose a valid participation status" });
    }
    const participation = await Participation.findById(req.params.id);
    if (!participation) {
      return res.status(404).json({ message: "Registration not found" });
    }
    if (!isMember(participation, req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this registration" });
    }

    participation.participationStatus = status;
    await participation.save();
    res.status(200).json({ message: "Participation status updated", participation });
  } catch (error) {
    console.error("UPDATE PARTICIPATION STATUS ERROR:", error);
    res.status(500).json({ message: "Server error while updating participation status" });
  }
};

module.exports = {
  getMyParticipations,
  getMyInvitations,
  registerForHackathon,
  inviteStudents,
  acceptInvitation,
  updateProject,
  updateParticipationStatus,
};
