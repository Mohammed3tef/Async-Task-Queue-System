const Task = require('../../src/models/Task');

describe('Task Model', () => {
    let task;
    const mockData = {
        type: 'test',
        payload: { data: 'test data' }
    };

    beforeEach(() => {
        task = new Task(mockData);
    });

    test('should create a new task with required properties', () => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('type', 'test');
        expect(task).toHaveProperty('payload', { data: 'test data' });
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('retryCount', 0);
        expect(task).toHaveProperty('status', 'pending');
    });

    test('should correctly check visibility with no visibility time', () => {
        expect(task.isVisible()).toBe(true);
    });

    test('should correctly check visibility with future visibility time', () => {
        task.visibilityTime = new Date(Date.now() + 10000); // 10 seconds in future
        expect(task.isVisible()).toBe(false);
    });

    test('should correctly set next retry with exponential backoff', () => {
        task.retryCount = 2;
        task.setNextRetry();
        
        expect(task.status).toBe('pending');
        expect(task.visibilityTime).toBeDefined();
        // Should be approximately 4 seconds in the future (2^2)
        const expectedDelay = 4000; // 4 seconds in ms
        const actualDelay = new Date(task.visibilityTime) - new Date();
        expect(actualDelay).toBeGreaterThan(expectedDelay - 100);
        expect(actualDelay).toBeLessThan(expectedDelay + 100);
    });
}); 