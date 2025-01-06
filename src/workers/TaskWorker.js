const config = require('../config');

class TaskWorker {
    constructor(queue, processFunction) {
        this.queue = queue;
        this.processFunction = processFunction;
        this.running = false;
        this.interval = null;
    }

    start() {
        if (this.running) {
            console.log('Worker is already running');
            return;
        }

        console.log('Starting worker...');
        this.running = true;
        this.interval = setInterval(async () => {
            if (this.running) {
                await this.processNextTask();
            }
        }, 1000);

        console.log('Worker started successfully');
    }

    stop() {
        if (!this.running) {
            console.log('Worker is already stopped');
            return;
        }

        console.log('Stopping worker...');
        this.running = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        console.log('Worker stopped successfully');
    }

    async processNextTask() {
        if (!this.running) return;

        const task = this.queue.getNextTask();
        if (!task) return;

        try {
            console.log(`\nProcessing task ${task.id}:`);
            console.log(`- Type: ${task.type}`);
            console.log(`- Attempt: ${task.retryCount + 1}/${task.maxRetries}`);

            await this.processFunction(task);
            this.queue.completeTask(task.id);
            console.log(`✓ Task ${task.id} completed successfully`);
        } catch (error) {
            console.error(`\n✗ Task ${task.id} failed:`);
            console.error(`- Error: ${error.message}`);
            await this.handleFailure(task, error.message);
        } finally {
            task.processing = false;
        }
    }

    async handleFailure(task, error) {
        if (task.shouldRetry()) {
            task.retryCount++;
            task.setNextRetry();
            this.queue.metrics.retryCount++;
        } else {
            console.error(`\n! Task ${task.id} failed permanently after ${task.maxRetries} retries`);
            this.queue.moveToDLQ(task.id, error);
        }
    }
}

module.exports = TaskWorker;
