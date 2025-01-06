class TaskQueue {
    constructor() {
        this.tasks = new Map();
        this.dlq = new Map();
        this.metrics = {
            processedCount: 0,
            failedCount: 0,
            retryCount: 0
        };
    }

    addTask(task) {
        console.log(`Adding task ${task.id} to queue`);
        this.tasks.set(task.id, task);
        console.log(`Current queue size: ${this.tasks.size}`);
        return task;
    }

    getAllTasks() {
        const tasks = Array.from(this.tasks.values());
        console.log(`\nRetrieving all tasks (${tasks.length} tasks):`);
        tasks.forEach(task => {
            console.log(`- Task ${task.id}:`);
            console.log(`  Type: ${task.type}`);
            console.log(`  Status: ${task.status}`);
            console.log(`  RetryCount: ${task.retryCount}`);
        });
        return tasks;
    }

    getNextTask() {
        const now = new Date();
        for (const [id, task] of this.tasks) {
            if (!task.processing && task.status === 'pending' && (!task.visibilityTime || now >= task.visibilityTime)) {
                task.processing = true;
                return task;
            }
        }
        return null;
    }

    completeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task) {
            console.log(`Completing task ${taskId}`);
            this.tasks.delete(taskId);
            this.metrics.processedCount++;
        }
    }

    moveToDLQ(taskId, error) {
        const task = this.tasks.get(taskId);
        if (task) {
            console.log(`\nMoving task ${taskId} to DLQ:`);
            console.log(`- Error: ${error}`);
            
            task.markAsFailed(error);
            this.dlq.set(taskId, task);
            this.tasks.delete(taskId);
            this.metrics.failedCount++;
            
            console.log(`- Current DLQ size: ${this.dlq.size}`);
            console.log(`- Tasks in DLQ:`);
            this.dlq.forEach((dlqTask, id) => {
                console.log(`  * ${id}: ${dlqTask.error}`);
            });
        }
    }

    getDLQ() {
        const dlqTasks = Array.from(this.dlq.values());
        console.log(`\nRetrieving DLQ contents (${dlqTasks.length} tasks):`);
        dlqTasks.forEach(task => {
            console.log(`- Task ${task.id}:`);
            console.log(`  Type: ${task.type}`);
            console.log(`  Error: ${task.error}`);
        });
        return dlqTasks;
    }

    clearDLQ() {
        const size = this.dlq.size;
        this.dlq.clear();
        return size;
    }

    getMetrics() {
        return {
            queueSize: this.tasks.size,
            dlqSize: this.dlq.size,
            ...this.metrics
        };
    }
}

module.exports = TaskQueue;
