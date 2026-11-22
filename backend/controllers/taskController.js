const Task = require('../models/Task.js');
const Team = require('../models/Team.js');

/**
 * @desc    Create a new task for a team
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo } = req.body;

        // User must be in a team to create a task
        if (!req.user || !req.user.teamId) {
            return res.status(400).json({ message: 'You must be in a team to create tasks' });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Please enter a task title' });
        }

        // Validate assigned user is part of the same team
        if (assignedTo) {
            const team = await Team.findById(req.user.teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            const isMember = team.members.some(
                (m) => m.user && m.user.toString() === assignedTo.toString()
            );
            if (!isMember) {
                return res.status(400).json({ message: 'Cannot assign task to a user outside your team' });
            }
        }

        const task = new Task({
            title: title.trim(),
            description: description ? description.trim() : '',
            assignedTo: assignedTo || null,
            team: req.user.teamId,
            createdBy: req.user._id,
        });

        const createdTask = await task.save();
        const populatedTask = await Task.findById(createdTask._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        res.status(201).json(populatedTask || createdTask);
    } catch (error) {
        console.error('CREATE TASK ERROR:', error);
        res.status(500).json({ message: 'Server error while creating task' });
    }
};

/**
 * @desc    Get all tasks for authenticated user's team
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
    try {
        if (!req.user || !req.user.teamId) {
            return res.status(200).json([]);
        }

        const tasks = await Task.find({ team: req.user.teamId })
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('GET TASKS ERROR:', error);
        res.status(500).json({ message: 'Server error while fetching tasks' });
    }
};

/**
 * @desc    Update a task status or details
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
    try {
        const { title, description, status, assignedTo } = req.body;

        if (!req.user || !req.user.teamId) {
            return res.status(400).json({ message: 'User must belong to a team' });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Ensure task belongs to the user's team
        if (task.team.toString() !== req.user.teamId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update tasks of another team' });
        }

        // Validate new assigned user belongs to the team
        if (assignedTo) {
            const team = await Team.findById(req.user.teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            const isMember = team.members.some(
                (m) => m.user && m.user.toString() === assignedTo.toString()
            );
            if (!isMember) {
                return res.status(400).json({ message: 'Cannot assign task to a user outside your team' });
            }
            task.assignedTo = assignedTo;
        } else if (assignedTo === null) {
            task.assignedTo = null;
        }

        if (title !== undefined && title.trim()) task.title = title.trim();
        if (description !== undefined) task.description = description.trim();
        if (status !== undefined && ['To Do', 'In Progress', 'Done'].includes(status)) {
            task.status = status;
        }

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('UPDATE TASK ERROR:', error);
        res.status(500).json({ message: 'Server error while updating task' });
    }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
    try {
        if (!req.user || !req.user.teamId) {
            return res.status(400).json({ message: 'User must belong to a team' });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Ensure task belongs to the user's team
        if (task.team.toString() !== req.user.teamId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete tasks of another team' });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Task removed successfully', id: req.params.id });
    } catch (error) {
        console.error('DELETE TASK ERROR:', error);
        res.status(500).json({ message: 'Server error while deleting task' });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};