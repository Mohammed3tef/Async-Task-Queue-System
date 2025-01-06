const express = require('express');
const TaskQueue = require('./models/Queue');
const TaskWorker = require('./workers/TaskWorker');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

// Create a single queue instance
const queue = new TaskQueue();

// Create a worker with a simple process function
const processTask = async (task) => {
    console.log(`Starting to process task ${task.id}`);
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (task.type === 'error') {
        throw new Error('Simulated error');
    }
    
    console.log(`Finished processing task ${task.id}`);
};

// Create and start the worker
const worker = new TaskWorker(queue, processTask);
worker.start(); // This should now work

// Use routes
app.use('/api', taskRoutes(queue));

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down gracefully...');
    worker.stop();
    process.exit(0);
});

module.exports = { app, worker, queue };
