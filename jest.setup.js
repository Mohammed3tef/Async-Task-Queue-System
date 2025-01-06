process.env.NODE_ENV = 'test';

// Add a global teardown to ensure all async operations are complete
afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
}); 