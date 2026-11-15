
const Team = require("../models/Team.js");
const User = require("../models/User.js");

// @desc Create a new team
// @route POST /api/teams
const createTeam = async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Please enter a team name",
      });
    }

    // Remove user from their previous team, if any
    if (req.user.teamId) {
      const oldTeam = await Team.findById(req.user.teamId);

      if (oldTeam) {
        oldTeam.members = oldTeam.members.filter(
          (member) => !member.user.equals(req.user._id)
        );

        await oldTeam.save();
      }
    }

    // Create new team
    const team = await Team.create({
      name: name.trim(),
      bio: bio?.trim() || "Our team is participating in a hackathon!",
      members: [
        {
          user: req.user._id,
          role: "leader",
        },
      ],
    });

    // Update user's team association
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        teamId: team._id,
        role: "leader",
      },
    });

    res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    console.error("CREATE TEAM ERROR:", error);

    res.status(500).json({
      message: "Server error while creating team",
    });
  }
};

// @desc Join a team using invite code
// @route POST /api/teams/join
const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({
        message: "Please enter an invite code",
      });
    }

    const team = await Team.findOne({
      inviteCode: inviteCode.trim(),
    });

    if (!team) {
      return res.status(404).json({
        message: "Team not found. Please check the invite code.",
      });
    }

    const isAlreadyMember = team.members.some((member) =>
      member.user.equals(req.user._id)
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        message: "You are already in this team",
      });
    }

    // Remove user from previous team
    if (req.user.teamId) {
      const oldTeam = await Team.findById(req.user.teamId);

      if (oldTeam) {
        oldTeam.members = oldTeam.members.filter(
          (member) => !member.user.equals(req.user._id)
        );

        await oldTeam.save();
      }
    }

    // Add user to new team
    team.members.push({
      user: req.user._id,
      role: "member",
    });

    await team.save();

    // Update user document
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        teamId: team._id,
        role: "member",
      },
    });

    res.status(200).json({
      message: "Joined team successfully",
      team,
    });
  } catch (error) {
    console.error("JOIN TEAM ERROR:", error);

    res.status(500).json({
      message: "Server error while joining team",
    });
  }
};

// @desc Get current user's team
// @route GET /api/teams/myteam
const getMyTeam = async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(404).json({
        message: "You are not part of any team",
      });
    }

    const team = await Team.findById(req.user.teamId)
      .populate("members.user", "name email")
      .lean();

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    res.status(200).json({
      message: "Fetched team successfully",
      team,
    });
  } catch (error) {
    console.error("GET MY TEAM ERROR:", error);

    res.status(500).json({
      message: "Server error while fetching team",
    });
  }
};

// @desc Update team name and bio
// @route PUT /api/teams/myteam
const updateMyTeam = async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (!req.user.teamId) {
      return res.status(404).json({
        message: "You are not part of any team",
      });
    }

    const team = await Team.findById(req.user.teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Only team leader can update team profile
    const membership = team.members.find((member) =>
      member.user.equals(req.user._id)
    );

    if (!membership || membership.role !== "leader") {
      return res.status(403).json({
        message: "Only the team leader can update team details",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Team name cannot be empty",
        });
      }

      team.name = name.trim();
    }

    if (bio !== undefined) {
      team.bio = bio.trim();
    }

    await team.save();

    res.status(200).json({
      message: "Team updated successfully",
      team,
    });
  } catch (error) {
    console.error("UPDATE TEAM ERROR:", error);

    res.status(500).json({
      message: "Server error while updating team",
    });
  }
};

// @desc Leave current team
// @route POST /api/teams/leave
const leaveTeam = async (req, res) => {
  try {
    const user = req.user;

    if (!user.teamId) {
      return res.status(400).json({
        message: "You are not in any team",
      });
    }

    const team = await Team.findById(user.teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    team.members = team.members.filter(
      (member) => !member.user.equals(user._id)
    );

    await team.save();

    await User.findByIdAndUpdate(user._id, {
      $unset: {
        teamId: "",
      },
      $set: {
        role: "member",
      },
    });

    res.status(200).json({
      message: "You have left the team successfully",
    });
  } catch (error) {
    console.error("LEAVE TEAM ERROR:", error);

    res.status(500).json({
      message: "Server error while leaving team",
    });
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getMyTeam,
  updateMyTeam,
  leaveTeam,
};
