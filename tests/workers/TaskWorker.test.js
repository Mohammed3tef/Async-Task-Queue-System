const TaskWorker = require('../../src/workers/TaskWorker');
const TaskQueue = require('../../src/models/Queue');
const Task = require('../../src/models/Task');

describe('TaskWorker', () => {
    let worker;
    let queue;
    let mockProcessFunction;
    let originalSetInterval;
    let originalClearInterval;

    beforeEach(() => {
        // Save original timer functions
        originalSetInterval = global.setInterval;
        originalClearInterval = global.clearInterval;

        // Mock timer functions
        global.setInterval = jest.fn().mockReturnValue('interval-id');
        global.clearInterval = jest.fn();

        queue = new TaskQueue();
        mockProcessFunction = jest.fn();
        worker = new TaskWorker(queue, mockProcessFunction);
        
        // Suppress console output
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore original timer functions
        global.setInterval = originalSetInterval;
        global.clearInterval = originalClearInterval;
        
        worker.stop();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('should start worker with interval', async () => {
        await worker.start();
        
        expect(worker.running).toBe(true);
        expect(worker.interval).toBe('interval-id');
        
        // Get the actual arguments passed to setInterval
        const [callback, interval] = global.setInterval.mock.calls[0];
        expect(typeof callback).toBe('function');
        expect(interval).toBe(1000);
    });

    test('should stop worker and clear interval', () => {
        worker.interval = 'interval-id';
        worker.running = true;
        
        worker.stop();
        
        expect(worker.running).toBe(false);
        expect(worker.interval).toBeNull();
        expect(global.clearInterval).toHaveBeenCalledWith('interval-id');
    });

    test('should process multiple tasks in interval', async () => {
        const task1 = new Task({ type: 'test1', payload: { data: 'test1' } });
        const task2 = new Task({ type: 'test2', payload: { data: 'test2' } });
        queue.addTask(task1);
        queue.addTask(task2);
        mockProcessFunction.mockResolvedValue();

        worker.running = true;
        await worker.processNextTask(); // Process first task
        await worker.processNextTask(); // Process second task

        expect(queue.metrics.processedCount).toBe(2);
    });

    test('should process task successfully', async () => {
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        queue.addTask(task);
        mockProcessFunction.mockResolvedValueOnce();
        
        worker.running = true;
        await worker.processNextTask();

        expect(mockProcessFunction).toHaveBeenCalledWith(expect.objectContaining({
            id: task.id,
            type: task.type,
            payload: task.payload
        }));
        expect(queue.metrics.processedCount).toBe(1);
    });

    test('should not process task when worker is not running', async () => {
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        queue.addTask(task);
        
        worker.running = false;
        await worker.processNextTask();
        
        expect(mockProcessFunction).not.toHaveBeenCalled();
    });

    test('should handle task failure and retry', async () => {
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        queue.addTask(task);
        mockProcessFunction.mockRejectedValueOnce(new Error('Test error'));
        
        worker.running = true;
        await worker.processNextTask();

        const updatedTask = queue.tasks.get(task.id);
        expect(updatedTask.retryCount).toBe(1);
        expect(updatedTask.status).toBe('pending');
        expect(queue.metrics.retryCount).toBe(1);
    });

    test('should move task to DLQ after max retries', async () => {
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        task.retryCount = task.maxRetries;
        queue.addTask(task);
        mockProcessFunction.mockRejectedValueOnce(new Error('Test error'));
        
        worker.running = true;
        await worker.processNextTask();

        expect(queue.dlq.has(task.id)).toBeTruthy();
        expect(queue.tasks.has(task.id)).toBeFalsy();
        expect(queue.metrics.failedCount).toBe(1);
    });

    test('should handle empty queue', async () => {
        worker.running = true;
        await worker.processNextTask();
        
        expect(mockProcessFunction).not.toHaveBeenCalled();
    });

    test('should log error messages during task failure', async () => {
        const consoleSpy = jest.spyOn(console, 'error');
        const task = new Task({ type: 'test', payload: { data: 'test' } });
        task.retryCount = task.maxRetries;
        queue.addTask(task);
        mockProcessFunction.mockRejectedValueOnce(new Error('Test error'));
        
        worker.running = true;
        await worker.processNextTask();

        expect(consoleSpy).toHaveBeenCalled();
    });
}); 