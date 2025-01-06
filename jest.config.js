module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js'
    ],
    coverageThreshold: {
        global: {
            branches: '70',
            functions: '70',
            lines: '70',
            statements: '70'
        }
    }
}; 