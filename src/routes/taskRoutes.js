const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

module.exports = (queue) => {
    // Add task
    router.post('/tasks', (req, res) => {
        try {
            const { type, payload, visibility_time } = req.body;
            
            if (!type || !payload) {
                return res.status(400).json({ 
                    error: 'Type and payload are required' 
                });
            }

            const task = new Task({ 
                type, 
                payload, 
                visibilityTime: visibility_time 
            });
            
            queue.addTask(task);
            
            res.status(201).json({
                id: task.id,
                status: 'Task added to queue',
                task: task.toJSON()
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get all tasks
    router.get('/tasks', (req, res) => {
        try {
            const tasks = queue.getAllTasks();
            res.json({
                count: tasks.length,
                tasks: tasks.map(task => task.toJSON())
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get task by ID
    router.get('/tasks/:id', (req, res) => {
        try {
            const task = queue.tasks.get(req.params.id);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json(task.toJSON());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get DLQ contents
    router.get('/dlq', (req, res) => {
        try {
            const dlqTasks = queue.getDLQ();
            res.json({
                count: dlqTasks.length,
                tasks: dlqTasks.map(task => task.toJSON())
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Clear DLQ
    router.delete('/dlq', (req, res) => {
        try {
            const removedCount = queue.clearDLQ();
            res.json({ 
                status: 'DLQ cleared',
                tasksRemoved: removedCount
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get metrics
    router.get('/metrics', (req, res) => {
        try {
            const metrics = queue.getMetrics();
            res.json(metrics);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
