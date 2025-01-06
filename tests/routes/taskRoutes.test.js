const request = require('supertest');
const { app, queue } = require('../../src/app');

describe('Task Routes', () => {
    let originalQueue;

    beforeEach(() => {
        originalQueue = { ...queue };
    });

    afterEach(() => {
        Object.assign(queue, originalQueue);
    });

    describe('POST /api/tasks', () => {
        test('should create a new task', async () => {
            const response = await request(app)
                .post('/api/tasks')
                .send({
                    type: 'test',
                    payload: { data: 'test data' }
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('status', 'Task added to queue');
        });

        test('should return 400 for invalid task data', async () => {
            const response = await request(app)
                .post('/api/tasks')
                .send({
                    payload: { data: 'test data' }
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        test('should handle server error when creating task', async () => {
            queue.addTask = jest.fn().mockImplementation(() => {
                throw new Error('Database error');
            });

            const response = await request(app)
                .post('/api/tasks')
                .send({
                    type: 'test',
                    payload: { data: 'test' }
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/dlq', () => {
        test('should return DLQ contents', async () => {
            const response = await request(app)
                .get('/api/dlq');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        test('should handle server error when getting DLQ', async () => {
            queue.getDLQ = jest.fn().mockImplementation(() => {
                throw new Error('Database error');
            });

            const response = await request(app)
                .get('/api/dlq');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('DELETE /api/dlq', () => {
        test('should clear DLQ', async () => {
            const response = await request(app)
                .delete('/api/dlq');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'DLQ cleared');
        });

        test('should handle server error when clearing DLQ', async () => {
            queue.clearDLQ = jest.fn().mockImplementation(() => {
                throw new Error('Database error');
            });

            const response = await request(app)
                .delete('/api/dlq');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/metrics', () => {
        test('should return queue metrics', async () => {
            const response = await request(app)
                .get('/api/metrics');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('queueSize');
            expect(response.body).toHaveProperty('dlqSize');
            expect(response.body).toHaveProperty('processedCount');
        });

        test('should handle server error when getting metrics', async () => {
            queue.getMetrics = jest.fn().mockImplementation(() => {
                throw new Error('Database error');
            });

            const response = await request(app)
                .get('/api/metrics');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
}); 