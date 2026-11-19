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
        if (!req.user.teamId) {
            return res.status(400).json({ message: 'You must be in a team to create tasks' });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Please enter a task title' });
        }

        // Validate assignedTo if provided (must belong to user's team)
        let validAssignedTo = null;
        if (assignedTo) {
            const team = await Team.findById(req.user.teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }

            const isMember = team.members.some(
                (member) => member.user && member.user.toString() === assignedTo.toString()
            );

            if (!isMember) {
                return res.status(400).json({
                    message: 'Cannot assign task to a user who is not a member of your team',
                });
            }

            validAssignedTo = assignedTo;
        }

        const task = new Task({
            title: title.trim(),
            description: description ? description.trim() : '',
            assignedTo: validAssignedTo,
            team: req.user.teamId,
            createdBy: req.user._id,
        });

        const createdTask = await task.save();
        const populatedTask = await Task.findById(createdTask._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        res.status(201).json(populatedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get all tasks for the authenticated user's team
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
    try {
        if (!req.user.teamId) {
            return res.status(400).json({ message: 'You are not part of any team' });
        }

        const tasks = await Task.find({ team: req.user.teamId })
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Update a specific task (status, title, description, assignee)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
    try {
        const { title, description, status, assignedTo } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Make sure the task belongs to the user's team
        if (task.team.toString() !== req.user.teamId.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        if (title !== undefined) task.title = title.trim();
        if (description !== undefined) task.description = description.trim();
        if (status !== undefined) {
            const validStatuses = ['To Do', 'In Progress', 'Done'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid task status' });
            }
            task.status = status;
        }

        if (assignedTo !== undefined) {
            if (assignedTo === null || assignedTo === '') {
                task.assignedTo = null;
            } else {
                const team = await Team.findById(req.user.teamId);
                if (!team) {
                    return res.status(404).json({ message: 'Team not found' });
                }

                const isMember = team.members.some(
                    (member) => member.user && member.user.toString() === assignedTo.toString()
                );

                if (!isMember) {
                    return res.status(400).json({
                        message: 'Cannot assign task to a user who is not a member of your team',
                    });
                }

                task.assignedTo = assignedTo;
            }
        }

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        res.status(200).json(populatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Delete a specific task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Make sure the task belongs to the user's team
        if (task.team.toString() !== req.user.teamId.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Task removed successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};
