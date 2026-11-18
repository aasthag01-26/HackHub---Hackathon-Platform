const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET /api/projects - Fetch showcase projects with search and domain filtering
router.get('/', async (req, res) => {
  try {
    const { search, domain, sort } = req.query;
    let query = {};

    if (domain && domain !== 'All') {
      query.domain = domain;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { tagline: searchRegex },
        { description: searchRegex },
        { technologies: searchRegex },
        { teamName: searchRegex },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') {
      sortOptions = { likes: -1, createdAt: -1 };
    }

    const projects = await Project.find(query).sort(sortOptions);
    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Error fetching showcase projects:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching projects' });
  }
});

// POST /api/projects - Publish a project to the showcase
router.post('/', async (req, res) => {
  try {
    const {
      title,
      tagline,
      description,
      domain,
      technologies,
      githubUrl,
      liveUrl,
      imageUrl,
      teamName,
      authorName,
      members,
    } = req.body;

    if (!title || !description || !githubUrl || !teamName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, githubUrl, teamName are required.',
      });
    }

    // URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(githubUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub repository URL format.',
      });
    }

    if (liveUrl && !urlPattern.test(liveUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Live deployment URL format.',
      });
    }

    const techArray = Array.isArray(technologies)
      ? technologies
      : typeof technologies === 'string'
      ? technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const memberArray = Array.isArray(members)
      ? members
      : typeof members === 'string'
      ? members.split(',').map((m) => m.trim()).filter(Boolean)
      : [];

    const newProject = await Project.create({
      title: title.trim(),
      tagline: (tagline || title).trim(),
      description: description.trim(),
      domain: domain || 'Web Development',
      technologies: techArray,
      githubUrl: githubUrl.trim(),
      liveUrl: (liveUrl || '').trim(),
      imageUrl: (imageUrl || '').trim(),
      teamName: teamName.trim(),
      authorName: (authorName || 'Anonymous Hacker').trim(),
      members: memberArray,
    });

    return res.status(201).json({
      success: true,
      message: 'Project published to showcase successfully!',
      data: newProject,
    });
  } catch (error) {
    console.error('Error publishing project:', error);
    return res.status(500).json({ success: false, message: 'Server error publishing project' });
  }
});

// POST /api/projects/:id/like - Toggle like on a project
router.post('/:id/like', async (req, res) => {
  try {
    const { userEmail } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userId = userEmail || 'anonymous_user';
    const hasLiked = project.likedBy.includes(userId);

    if (hasLiked) {
      project.likedBy = project.likedBy.filter((id) => id !== userId);
      project.likes = Math.max(0, project.likes - 1);
    } else {
      project.likedBy.push(userId);
      project.likes += 1;
    }

    await project.save();

    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      likes: project.likes,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ success: false, message: 'Server error toggling like' });
  }
});

module.exports = router;
