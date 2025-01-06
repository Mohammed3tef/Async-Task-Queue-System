const TaskQueue = require('../../src/models/Queue');
const Task = require('../../src/models/Task');

describe('TaskQueue', () => {
    let queue;
    
    beforeEach(() => {
        queue = new TaskQueue();
    });

    test('should add task to queue', () => {
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        const addedTask = queue.addTask(task);
        
        expect(queue.tasks.get(task.id)).toBeDefined();
        expect(addedTask).toEqual(task);
    });

    test('should get next available task', () => {
        const task1 = new Task({ type: 'test1', payload: { data: 'test1' } });
        const task2 = new Task({ 
            type: 'test2', 
            payload: { data: 'test2' },
            visibilityTime: new Date(Date.now() + 10000)
        });

        queue.addTask(task1);
        queue.addTask(task2);

        const nextTask = queue.getNextTask();
        expect(nextTask).toEqual(task1);
        expect(nextTask.status).toBe('processing');
    });

    test('should move task to DLQ', () => {
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        queue.addTask(task);
        
        queue.moveToDLQ(task.id, 'Test error');
        
        expect(queue.tasks.has(task.id)).toBeFalsy();
        expect(queue.dlq.has(task.id)).toBeTruthy();
        expect(queue.dlq.get(task.id).lastError).toBe('Test error');
        expect(queue.metrics.failedCount).toBe(1);
    });

    test('should clear DLQ', () => {
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        queue.addTask(task);
        queue.moveToDLQ(task.id, 'Test error');
        
        queue.clearDLQ();
        
        expect(queue.dlq.size).toBe(0);
    });

    test('should return correct metrics', () => {
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        queue.addTask(task);
        queue.moveToDLQ(task.id, 'Test error');
        
        const metrics = queue.getMetrics();
        
        expect(metrics).toEqual({
            queueSize: 0,
            dlqSize: 1,
            processedCount: 0,
            failedCount: 1,
            retryCount: 0
        });
    });

    test('should not return task with future visibility time', () => {
        const task = new Task({ 
            type: 'test', 
            payload: { data: 'test' },
            visibilityTime: new Date(Date.now() + 10000)
        });
        queue.addTask(task);
        
        const nextTask = queue.getNextTask();
        expect(nextTask).toBeNull();
    });

    test('should complete task successfully', () => {
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        queue.addTask(task);
        
        queue.completeTask(task.id);
        
        expect(queue.tasks.size).toBe(0);
        expect(queue.metrics.processedCount).toBe(1);
    });

    test('should handle completing non-existent task', () => {
        queue.completeTask('non-existent-id');
        expect(queue.metrics.processedCount).toBe(0);
    });
}); 