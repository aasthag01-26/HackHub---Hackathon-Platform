const Team = require('../models/Team.js');
const User = require('../models/User.js');
const nodemailer = require('nodemailer');

// @desc    Create a new team
// @route   POST /api/teams
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please enter a team name' });
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
      name,
      members: [{ user: req.user._id, role: 'leader' }],
    });

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { teamId: team._id, role: 'leader' } },
      { new: true }
    );

    console.log('Updated user teamId:', updatedUser?.teamId);

    res.status(201).json({
      message: 'Team created successfully',
      team,
    });
  } catch (error) {
    console.error('CREATE TEAM ERROR:', error);
    res.status(500).json({ message: 'Server error while creating team' });
  }
};

// @desc    Join a team using invite code
// @route   POST /api/teams/join
const joinTeam = async (req, res) => {
  try {
    const cleanCode = (req.body.inviteCode || '').trim();
    if (!cleanCode) {
      return res.status(400).json({ message: 'Please enter an invite code' });
    }

    const team = await Team.findOne({ inviteCode: cleanCode });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isAlreadyMember = team.members.some((m) =>
      m.user.equals(req.user._id)
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'You are already in this team' });
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

    // Add user to new team
    team.members.push({ user: req.user._id, role: 'member' });

    // Remove matching email from pendingInvites once joined
    const joiningEmail = (req.user?.email || '').trim().toLowerCase();
    if (joiningEmail && Array.isArray(team.pendingInvites)) {
      team.pendingInvites = team.pendingInvites.filter(
        (inv) => (inv.email || '').toLowerCase() !== joiningEmail
      );
    }

    await team.save();

    // Update user
    await User.findByIdAndUpdate(req.user._id, { teamId: team._id });

    res.status(200).json({
      message: 'Joined team successfully',
      team,
    });
  } catch (error) {
    console.error('JOIN TEAM ERROR:', error);
    res.status(500).json({ message: 'Server error while joining team' });
  }
};

// @desc    Get current user's team details
// @route   GET /api/teams/myteam
const getMyTeam = async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(404).json({ message: 'You are not part of any team' });
    }

    const team = await Team.findById(req.user.teamId)
      .populate('members.user', 'name email')
      .lean();

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({
      message: 'Fetched team successfully',
      team,
    });
  } catch (error) {
    console.error('GET MY TEAM ERROR:', error);
    res.status(500).json({ message: 'Server error while fetching team' });
  }
};

// @desc    Leave the current team
// @route   POST /api/teams/leave
const leaveTeam = async (req, res) => {
  try {
    const user = req.user;
    if (!user.teamId) {
      return res.status(400).json({ message: 'You are not in any team' });
    }

    const team = await Team.findById(user.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.members = team.members.filter((m) => !m.user.equals(user._id));
    await team.save();

    await User.findByIdAndUpdate(user._id, { $unset: { teamId: '' } });

    res.status(200).json({
      message: 'You have left the team successfully',
    });
  } catch (error) {
    console.error('LEAVE TEAM ERROR:', error);
    res.status(500).json({ message: 'Server error while leaving team' });
  }
};

// @desc    Send team invite via email (with fallback join link)
// @route   POST /api/teams/invite
const inviteMember = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Please enter a teammate email address' });
    }

    if (!req.user || !req.user.teamId) {
      return res.status(400).json({ message: 'You must be in a team to send invites' });
    }

    const team = await Team.findById(req.user.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Save email in pendingInvites if not already present
    const existingPending = (team.pendingInvites || []).some(
      (inv) => inv.email && inv.email.toLowerCase() === email
    );
    if (!existingPending) {
      team.pendingInvites = team.pendingInvites || [];
      team.pendingInvites.push({
        email,
        role: 'member',
        status: 'Pending',
      });
      await team.save();
    }

    const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const joinLink = `${baseUrl}/auth?mode=register&inviteCode=${encodeURIComponent(
      team.inviteCode
    )}&email=${encodeURIComponent(email)}`;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"HackHub" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `You're invited to join team "${team.name}" on HackHub`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2>Join Team "${team.name}" on HackHub</h2>
            <p><strong>${req.user.name || 'Your team leader'}</strong> invited you to collaborate on HackHub.</p>
            <p><strong>Invite Code:</strong> <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;">${team.inviteCode}</code></p>
            <p>Click the button below to create your account (or log in) and join the team:</p>
            <p>
              <a href="${joinLink}" style="display:inline-block;padding:10px 18px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
                Create Account &amp; Join Team
              </a>
            </p>
          </div>
        `,
      });

      return res.status(200).json({
        message: `Invite sent to ${email}`,
        inviteCode: team.inviteCode,
        joinLink,
      });
    }

    return res.status(200).json({
      message: `Invite link generated for ${email} (configure EMAIL_USER & EMAIL_PASS in .env to send live Gmail)`,
      inviteCode: team.inviteCode,
      joinLink,
    });
  } catch (error) {
    console.error('INVITE MEMBER ERROR:', error);
    res.status(500).json({ message: 'Server error while sending invite' });
  }
};

module.exports = { createTeam, joinTeam, getMyTeam, leaveTeam, inviteMember };