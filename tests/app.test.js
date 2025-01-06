const { app, worker, queue } = require('../src/app');

describe('App Configuration', () => {
    test('should export app instance', () => {
        expect(app).toBeDefined();
        expect(typeof app.listen).toBe('function');
    });

    test('should export worker instance', () => {
        expect(worker).toBeDefined();
        expect(typeof worker.processNextTask).toBe('function');
    });

    test('should export queue instance', () => {
        expect(queue).toBeDefined();
        expect(typeof queue.addTask).toBe('function');
    });

    test('should process task without error', async () => {
        const processTask = require('../src/app').processTask;
        const task = { id: '123', type: 'test', payload: { data: 'test' } };
        await processTask(task);
        // Should not throw
    });

    test('should handle error task type', async () => {
        const processTask = require('../src/app').processTask;
        const task = { id: '123', type: 'error', payload: { data: 'test' } };
        await expect(processTask(task)).rejects.toThrow('Simulated error');
    });
}); 