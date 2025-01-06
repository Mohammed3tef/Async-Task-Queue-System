const { v4: uuidv4 } = require('uuid');

class Task {
    constructor({ type, payload, visibilityTime = null }) {
        this.id = uuidv4();
        this.type = type;
        this.payload = payload;
        this.visibilityTime = visibilityTime ? new Date(visibilityTime) : null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.status = 'pending';
        this.error = null;
        this.createdAt = new Date();
        this.baseRetryDelay = 2000; // 2 seconds base delay
        this.processing = false;
    }

    setNextRetry() {
        // Calculate delay in milliseconds with exponential backoff
        const delayMs = Math.min(
            this.baseRetryDelay * Math.pow(2, this.retryCount - 1), // 2s, 4s, 8s
            30000 // Max 30 seconds
        );

        // Set next visibility time
        const now = new Date();
        this.visibilityTime = new Date(now.getTime() + delayMs);

        console.log(`\nRetry ${this.retryCount}/${this.maxRetries} for task ${this.id}:`);
        console.log(`- Current time: ${now.toLocaleTimeString()}`);
        console.log(`- Next attempt: ${this.visibilityTime.toLocaleTimeString()}`);

        return this.visibilityTime;
    }

    shouldRetry() {
        return this.retryCount < this.maxRetries;
    }

    markAsFailed(error) {
        this.status = 'failed';
        this.error = error;
        this.failedAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            payload: this.payload,
            status: this.status,
            retryCount: this.retryCount,
            maxRetries: this.maxRetries,
            error: this.error,
            failedAt: this.failedAt?.toLocaleTimeString(),
            visibilityTime: this.visibilityTime ? this.visibilityTime.toISOString() : null,
            createdAt: this.createdAt.toISOString()
        };
    }
}

module.exports = Task;
