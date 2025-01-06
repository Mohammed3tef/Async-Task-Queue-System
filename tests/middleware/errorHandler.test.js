const errorHandler = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    let originalConsoleError;

    beforeEach(() => {
        // Save original console.error
        originalConsoleError = console.error;
        // Mock console.error to prevent output during tests
        console.error = jest.fn();

        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        // Restore original console.error
        console.error = originalConsoleError;
    });

    test('should handle errors in development mode', () => {
        process.env.NODE_ENV = 'development';
        const error = new Error('Test error');
        error.status = 400;

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(console.error).toHaveBeenCalledWith(error.stack);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: {
                message: 'Test error',
                stack: error.stack
            }
        });
    });

    test('should handle errors in production mode', () => {
        process.env.NODE_ENV = 'production';
        const error = new Error('Test error');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(console.error).toHaveBeenCalledWith(error.stack);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: {
                message: 'Test error'
            }
        });
    });
}); 