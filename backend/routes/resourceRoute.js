const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');
const Resource = require('../models/Resource.js');

/**
 * @route   GET /api/resources
 * @desc    Get all resources for the authenticated user's team
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.teamId) {
      return res.status(400).json({ message: 'You must belong to a team to view resources' });
    }

    const { category, search } = req.query;
    const query = { team: req.user.teamId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }, { url: regex }];
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error fetching team resources' });
  }
});

/**
 * @route   POST /api/resources
 * @desc    Add a new learning resource or documentation link
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.teamId) {
      return res.status(400).json({ message: 'You must belong to a team to add resources' });
    }

    const { title, url, category, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Resource title is required' });
    }

    if (!url || !url.trim()) {
      return res.status(400).json({ message: 'Resource URL is required' });
    }

    const validCategories = [
      'Documentation',
      'Dataset',
      'Tutorial',
      'API Reference',
      'Design',
      'Other',
    ];
    const chosenCategory = validCategories.includes(category) ? category : 'Documentation';

    const newResource = new Resource({
      team: req.user.teamId,
      title: title.trim(),
      url: url.trim(),
      category: chosenCategory,
      description: description ? description.trim() : '',
      addedBy: req.user._id,
      addedByName: req.user.name || 'Teammate',
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Server error creating resource' });
  }
});

/**
 * @route   PUT /api/resources/:id
 * @desc    Update a resource
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.teamId) {
      return res.status(400).json({ message: 'You must belong to a team to update resources' });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.team.toString() !== req.user.teamId.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this resource' });
    }

    const { title, url, category, description } = req.body;

    if (title !== undefined) resource.title = title.trim();
    if (url !== undefined) resource.url = url.trim();
    if (category !== undefined) {
      const validCategories = [
        'Documentation',
        'Dataset',
        'Tutorial',
        'API Reference',
        'Design',
        'Other',
      ];
      if (validCategories.includes(category)) {
        resource.category = category;
      }
    }
    if (description !== undefined) resource.description = description.trim();

    const updated = await resource.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Server error updating resource' });
  }
});

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete a resource
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.teamId) {
      return res.status(400).json({ message: 'You must belong to a team to delete resources' });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.team.toString() !== req.user.teamId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error deleting resource' });
  }
});

module.exports = router;
