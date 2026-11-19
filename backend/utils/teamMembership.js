const isTeamMember = (team, userId) => {
  if (!team || !userId || !Array.isArray(team.members)) {
    return false;
  }

  return team.members.some((member) => {
    const memberId = member.user && member.user._id
      ? member.user._id
      : member.user;
    return memberId && memberId.toString() === userId.toString();
  });
};

module.exports = { isTeamMember };
