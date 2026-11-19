const Team = require("../models/Team.js");
const User = require("../models/User.js");
const { nanoid } = require("nanoid");

// Helper: Check if user is leader of the team
const isUserTeamLeader = (team, userId) => {
  const member = team.members.find((m) => m.user._id ? m.user._id.equals(userId) : m.user.equals(userId));
  return member && member.role === "leader";
};

// @desc    Create a new team
// @route   POST /api/teams
const createTeam = async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Please enter a team name" });
    }

    // If user already in a team, remove them from that team
    if (req.user.teamId) {
      const oldTeam = await Team.findById(req.user.teamId);
      if (oldTeam) {
        oldTeam.members = oldTeam.members.filter(
          (m) => !m.user.equals(req.user._id)
        );
        await oldTeam.save();
      }
    }

    // Create a new team with the user as leader
    const team = await Team.create({
      name: name.trim(),
      bio: bio ? bio.trim() : "",
      members: [
        {
          user: req.user._id,
          role: "leader",
          responsibility: "Team Leader & Architect",
        },
      ],
    });

    // Update user document
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { teamId: team._id, role: "leader" } },
      { new: true }
    );

    res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    console.error("CREATE TEAM ERROR:", error);
    res.status(500).json({ message: "Server error while creating team" });
  }
};

// @desc    Join a team using invite code
// @route   POST /api/teams/join
const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const team = await Team.findOne({ inviteCode });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isAlreadyMember = team.members.some((m) =>
      m.user.equals(req.user._id)
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: "You are already in this team" });
    }

    // If user was in an old team, remove them from there first
    if (req.user.teamId) {
      const oldTeam = await Team.findById(req.user.teamId);
      if (oldTeam) {
        oldTeam.members = oldTeam.members.filter(
          (m) => !m.user.equals(req.user._id)
        );
        await oldTeam.save();
      }
    }

    // Add user to new team with 'member' role
    team.members.push({
      user: req.user._id,
      role: "member",
      responsibility: "Team Member",
    });
    await team.save();

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      $set: { teamId: team._id, role: "member" },
    });

    res.status(200).json({
      message: "Joined team successfully",
      team,
    });
  } catch (error) {
    console.error("JOIN TEAM ERROR:", error);
    res.status(500).json({ message: "Server error while joining team" });
  }
};

// @desc    Get current user's team details
// @route   GET /api/teams/myteam
const getMyTeam = async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(404).json({ message: "You are not part of any team" });
    }

    const team = await Team.findById(req.user.teamId)
      .populate("members.user", "name email")
      .lean();

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Find current user's role in this team
    const currentUserMember = team.members.find((m) =>
      m.user?._id ? m.user._id.toString() === req.user._id.toString() : m.user?.toString() === req.user._id.toString()
    );

    res.status(200).json({
      message: "Fetched team successfully",
      team,
      currentUserRole: currentUserMember?.role || "member",
      isLeader: currentUserMember?.role === "leader",
    });
  } catch (error) {
    console.error("GET MY TEAM ERROR:", error);
    res.status(500).json({ message: "Server error while fetching team" });
  }
};

// @desc    Update team profile (Leader only)
// @route   PUT /api/teams/profile
const updateTeamProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    if (!req.user.teamId) {
      return res.status(400).json({ message: "You are not part of any team" });
    }

    const team = await Team.findById(req.user.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Authorization: Leader only
    if (!isUserTeamLeader(team, req.user._id)) {
      return res.status(403).json({
        message: "Forbidden: Only team leaders are authorized to edit team settings.",
      });
    }

    if (name) team.name = name.trim();
    if (bio !== undefined) team.bio = bio.trim();

    await team.save();

    res.json({
      message: "Team profile updated successfully",
      team,
    });
  } catch (error) {
    console.error("UPDATE TEAM PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error updating team profile" });
  }
};

// @desc    Update member role and responsibility (Leader only)
// @route   PUT /api/teams/members/:userId/role
const updateMemberRole = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { role, responsibility } = req.body;

    if (!req.user.teamId) {
      return res.status(400).json({ message: "You are not part of any team" });
    }

    const team = await Team.findById(req.user.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Authorization check
    if (!isUserTeamLeader(team, req.user._id)) {
      return res.status(403).json({
        message: "Forbidden: Only team leaders can modify member roles and responsibilities.",
      });
    }

    const memberIndex = team.members.findIndex(
      (m) => m.user.toString() === targetUserId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: "Member not found on this team" });
    }

    // Ensure at least one leader remains
    if (
      team.members[memberIndex].role === "leader" &&
      role &&
      role !== "leader"
    ) {
      const leaderCount = team.members.filter((m) => m.role === "leader").length;
      if (leaderCount <= 1) {
        return res.status(400).json({
          message: "Cannot demote the sole team leader. Promote another leader first.",
        });
      }
    }

    if (role) {
      team.members[memberIndex].role = role;
      // Also update User document role
      await User.findByIdAndUpdate(targetUserId, { $set: { role } });
    }

    if (responsibility !== undefined) {
      team.members[memberIndex].responsibility = responsibility.trim();
    }

    await team.save();

    res.json({
      message: "Member role and responsibility updated successfully",
      members: team.members,
    });
  } catch (error) {
    console.error("UPDATE MEMBER ROLE ERROR:", error);
    res.status(500).json({ message: "Server error updating member role" });
  }
};

// @desc    Remove a member from the team (Leader only)
// @route   DELETE /api/teams/members/:userId
const removeMember = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    if (!req.user.teamId) {
      return res.status(400).json({ message: "You are not part of any team" });
    }

    const team = await Team.findById(req.user.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Authorization: Leader only
    if (!isUserTeamLeader(team, req.user._id)) {
      return res.status(403).json({
        message: "Forbidden: Only team leaders can remove members from the team.",
      });
    }

    // Cannot remove oneself via this route (must use leaveTeam or transfer leadership)
    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({
        message: "Leaders cannot remove themselves. Use Leave Team or reassign leadership.",
      });
    }

    team.members = team.members.filter(
      (m) => m.user.toString() !== targetUserId
    );
    await team.save();

    // Unset user's teamId
    await User.findByIdAndUpdate(targetUserId, {
      $unset: { teamId: "" },
      $set: { role: "member" },
    });

    res.json({
      message: "Team member removed successfully",
      members: team.members,
    });
  } catch (error) {
    console.error("REMOVE MEMBER ERROR:", error);
    res.status(500).json({ message: "Server error removing team member" });
  }
};

// @desc    Regenerate team invite code (Leader only)
// @route   POST /api/teams/invite-code
const regenerateInviteCode = async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ message: "You are not part of any team" });
    }

    const team = await Team.findById(req.user.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (!isUserTeamLeader(team, req.user._id)) {
      return res.status(403).json({
        message: "Forbidden: Only team leaders can reset the invite code.",
      });
    }

    team.inviteCode = nanoid(8);
    await team.save();

    res.json({
      message: "Invite code regenerated successfully",
      inviteCode: team.inviteCode,
    });
  } catch (error) {
    console.error("REGENERATE INVITE ERROR:", error);
    res.status(500).json({ message: "Server error regenerating invite code" });
  }
};

// @desc    Leave the current team
// @route   POST /api/teams/leave
const leaveTeam = async (req, res) => {
  try {
    const user = req.user;
    if (!user.teamId) {
      return res.status(400).json({ message: "You are not in any team" });
    }

    const team = await Team.findById(user.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // If sole member or sole leader leaving, handle cleanly
    const isLeader = isUserTeamLeader(team, user._id);
    const leaders = team.members.filter((m) => m.role === "leader");

    if (isLeader && leaders.length === 1 && team.members.length > 1) {
      // Auto-promote next member to leader
      const nextMember = team.members.find((m) => !m.user.equals(user._id));
      if (nextMember) {
        nextMember.role = "leader";
        await User.findByIdAndUpdate(nextMember.user, { $set: { role: "leader" } });
      }
    }

    team.members = team.members.filter((m) => !m.user.equals(user._id));

    if (team.members.length === 0) {
      await Team.findByIdAndDelete(team._id);
    } else {
      await team.save();
    }

    await User.findByIdAndUpdate(user._id, { $unset: { teamId: "" } });

    res.status(200).json({
      message: "You have left the team successfully",
    });
  } catch (error) {
    console.error("LEAVE TEAM ERROR:", error);
    res.status(500).json({ message: "Server error while leaving team" });
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getMyTeam,
  updateTeamProfile,
  updateMemberRole,
  removeMember,
  regenerateInviteCode,
  leaveTeam,
};
