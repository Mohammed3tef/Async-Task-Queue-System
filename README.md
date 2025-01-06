# Async Task Queue System

A robust asynchronous task processing system built with Node.js that handles task queuing, retries, and dead-letter queue management.

## Features

- ✨ Asynchronous task processing
- 🔄 Automatic retries with exponential backoff
- ⏰ Delayed task execution support
- 💀 Dead Letter Queue (DLQ) for failed tasks
- 📊 Real-time metrics
- 🚦 FIFO (First-In-First-Out) queue processing
- 🔍 Comprehensive task tracking

## Installation

```

## API Endpoints

### 1. Add Task
```

### 2. Get All Tasks
```

### 3. Get Task by ID
```

### 4. Get DLQ Contents
```

### 5. Clear DLQ
```

### 6. Get Metrics
```

## Error Handling

The system handles various types of errors:
- Task processing failures
- Invalid task data
- Queue operation errors
- API request errors

Each error is logged and handled appropriately:
- Processing errors trigger retries
- Fatal errors move tasks to DLQ
- API errors return appropriate status codes

## Monitoring

Monitor your task queue using the metrics endpoint:
- Queue size
- DLQ size
- Processed task count
- Failed task count
- Retry count

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Task Processing

### Retry Logic
- Tasks that fail during processing are automatically retried
- Exponential backoff: 2^retryCount seconds (2s, 4s, 8s)
- Maximum 3 retry attempts
- Failed tasks after max retries are moved to DLQ

### Task States
- `pending`: Waiting to be processed
- `processing`: Currently being processed
- `failed`: Failed after max retries (in DLQ)
- `completed`: Successfully processed

## Example Usage

### Creating a Task
```

### Checking Task Status
```

## Development

### Project Structure
```
src/
├── models/
│   ├── Queue.js      # Queue implementation
│   └── Task.js       # Task model
├── workers/
│   └── TaskWorker.js # Task processing worker
├── routes/
│   └── taskRoutes.js # API routes
├── middleware/
│   └── errorHandler.js
├── app.js            # Express app setup
└── server.js         # Server entry point
```

### Running Tests
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Environment Variables
```
PORT=3000              # Server port (default: 3000)
NODE_ENV=development   # Environment (development/production)
```