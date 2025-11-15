# Auto Runner

The Auto Runner is a scheduled task management system for the CRM Business Predictor application. It enables automated execution of recurring tasks such as batch predictions, analytics updates, data cleanup, and health checks.

## Features

- **Task Scheduling**: Schedule tasks using cron or interval-based triggers
- **Built-in Tasks**: Pre-configured tasks for common operations
- **Job Management**: Add, remove, and monitor scheduled jobs via API or UI
- **Execution History**: Track job execution results and status
- **Automatic Startup**: Auto Runner starts automatically with the application

## Built-in Tasks

The Auto Runner includes the following built-in tasks:

1. **health_check**: System health validation
2. **cleanup_old_data**: Remove temporary and old data files
3. **analytics_update**: Refresh analytics and statistics
4. **batch_predictions**: Process queued prediction requests
5. **model_health_check**: Validate ML model performance

## Installation

The Auto Runner is automatically installed with the application. To ensure dependencies are installed:

```bash
cd backend
pip install -r requirements.txt
```

## Configuration

Default job configurations are defined in `backend/auto_runner_config.json`. This file includes:

- Example job configurations
- Schedule type descriptions
- Available tasks reference
- Usage notes

### Schedule Types

#### Interval Schedule

Run tasks at regular intervals:

```json
{
  "job_id": "hourly_update",
  "task_name": "analytics_update",
  "schedule_type": "interval",
  "schedule_config": {
    "hours": 1,
    "minutes": 0
  },
  "enabled": true
}
```

Supported interval parameters:
- `weeks`: Number of weeks
- `days`: Number of days
- `hours`: Number of hours
- `minutes`: Number of minutes
- `seconds`: Number of seconds

#### Cron Schedule

Run tasks on a cron-like schedule:

```json
{
  "job_id": "daily_cleanup",
  "task_name": "cleanup_old_data",
  "schedule_type": "cron",
  "schedule_config": {
    "hour": 2,
    "minute": 0
  },
  "enabled": true
}
```

Supported cron parameters:
- `year`: 4-digit year
- `month`: Month (1-12)
- `day`: Day of month (1-31)
- `week`: ISO week (1-53)
- `day_of_week`: Day of week (0-6, Monday is 0)
- `hour`: Hour (0-23)
- `minute`: Minute (0-59)
- `second`: Second (0-59)

**Note**: All times are in UTC timezone.

## API Endpoints

### Get Auto Runner Status

```http
GET /api/auto-runner/status
```

Returns the current status of the Auto Runner including running state, job count, and available tasks.

### Get Available Tasks

```http
GET /api/auto-runner/tasks
```

Returns a list of all available task names that can be scheduled.

### Get All Jobs

```http
GET /api/auto-runner/jobs
```

Returns all currently scheduled jobs.

### Get Specific Job

```http
GET /api/auto-runner/jobs/{job_id}
```

Returns details for a specific job.

### Create Job

```http
POST /api/auto-runner/jobs
Content-Type: application/json

{
  "job_id": "my_custom_job",
  "task_name": "health_check",
  "schedule_type": "interval",
  "schedule_config": {
    "hours": 2
  },
  "enabled": true
}
```

Creates a new scheduled job.

### Delete Job

```http
DELETE /api/auto-runner/jobs/{job_id}
```

Removes a scheduled job.

### Get Execution History

```http
GET /api/auto-runner/history?limit=20
```

Returns recent job execution history (default: last 20 executions).

### Start Auto Runner

```http
POST /api/auto-runner/start
```

Starts the Auto Runner scheduler.

### Stop Auto Runner

```http
POST /api/auto-runner/stop
```

Stops the Auto Runner scheduler.

## Using the Web Interface

The Auto Runner can be managed through the web UI:

1. Navigate to **Settings** page
2. Scroll to the **Auto Runner** section
3. View current status and scheduled jobs
4. Click **Add Job** to create a new scheduled task
5. Configure job parameters and schedule
6. Click **Create Job** to activate

### UI Features

- **Status Dashboard**: View Auto Runner status and metrics
- **Job Management**: Add, view, and delete scheduled jobs
- **Execution History**: Monitor recent task executions
- **Start/Stop Controls**: Control Auto Runner state
- **Real-time Updates**: Auto-refreshes every 30 seconds

## Usage Examples

### Example 1: Daily Health Check

Schedule a health check every day at midnight UTC:

```bash
curl -X POST http://localhost:8000/api/auto-runner/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "daily_health",
    "task_name": "health_check",
    "schedule_type": "cron",
    "schedule_config": {
      "hour": 0,
      "minute": 0
    },
    "enabled": true
  }'
```

### Example 2: Hourly Analytics Update

Update analytics every hour:

```bash
curl -X POST http://localhost:8000/api/auto-runner/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "hourly_analytics",
    "task_name": "analytics_update",
    "schedule_type": "interval",
    "schedule_config": {
      "hours": 1
    },
    "enabled": true
  }'
```

### Example 3: Weekly Data Cleanup

Clean up old data every Sunday at 2 AM UTC:

```bash
curl -X POST http://localhost:8000/api/auto-runner/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "weekly_cleanup",
    "task_name": "cleanup_old_data",
    "schedule_type": "cron",
    "schedule_config": {
      "day_of_week": 0,
      "hour": 2,
      "minute": 0
    },
    "enabled": true
  }'
```

## Creating Custom Tasks

To add custom tasks to the Auto Runner:

1. Open `backend/services/auto_runner.py`
2. Create a new async task function:

```python
async def _task_my_custom_task(self):
    """Custom task description"""
    logger.info("Running my custom task")
    try:
        # Your task logic here
        result = {
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Custom task completed"
        }
        self._add_to_history("my_custom_task", "success", result)
        return result
    except Exception as e:
        logger.error(f"Custom task failed: {e}")
        self._add_to_history("my_custom_task", "error", {"error": str(e)})
        raise
```

3. Register the task in `_register_builtin_tasks()`:

```python
def _register_builtin_tasks(self):
    # ... existing tasks ...
    self.register_task("my_custom_task", self._task_my_custom_task)
```

4. Restart the application to load the new task

## Troubleshooting

### Auto Runner not starting

- Check backend logs for startup errors
- Ensure APScheduler is installed: `pip install apscheduler==3.10.4`
- Verify no port conflicts or permission issues

### Jobs not executing

- Verify the Auto Runner is running: Check status at `/api/auto-runner/status`
- Check job is enabled in configuration
- Review execution history for error messages
- Ensure schedule configuration is valid

### Missing tasks

- Check `_register_builtin_tasks()` method in `auto_runner.py`
- Verify task functions are properly defined
- Restart the application after adding new tasks

## Best Practices

1. **Testing**: Test new jobs with short intervals first, then adjust to production schedule
2. **Monitoring**: Regularly check execution history for failures
3. **Resource Usage**: Avoid scheduling too many concurrent jobs
4. **Time Zones**: Remember all times are in UTC
5. **Error Handling**: Review failed executions and adjust task implementations
6. **Job IDs**: Use descriptive, unique job IDs for easy management

## Architecture

The Auto Runner uses APScheduler, a powerful Python task scheduling library:

- **Scheduler**: AsyncIOScheduler for async/await support
- **Job Store**: In-memory storage (jobs are lost on restart)
- **Executors**: AsyncIOExecutor for non-blocking execution
- **Triggers**: CronTrigger and IntervalTrigger for flexible scheduling

### Job Lifecycle

1. Job is created via API or UI
2. Scheduler validates configuration
3. Job is added to scheduler with trigger
4. Scheduler executes job at scheduled time
5. Execution result is logged to history
6. Process repeats based on schedule

## Future Enhancements

Potential improvements for the Auto Runner:

- [ ] Persistent job storage (database)
- [ ] Job execution notifications (email, webhooks)
- [ ] Advanced scheduling options (date ranges, exclusions)
- [ ] Job dependencies and chains
- [ ] Custom task parameters
- [ ] Performance metrics and monitoring
- [ ] Multi-instance coordination
- [ ] Job retry policies
- [ ] Task priority levels

## License

This feature is part of the CRM Business Predictor application.
