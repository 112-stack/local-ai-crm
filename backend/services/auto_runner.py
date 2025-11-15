"""
Auto Runner Service
Handles scheduled tasks and automated operations for the CRM system
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Callable
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor
import json
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AutoRunnerService:
    """
    Service for managing automated scheduled tasks
    """

    def __init__(self):
        """Initialize the auto runner service"""
        self.scheduler = None
        self.is_running = False
        self.task_registry: Dict[str, Callable] = {}
        self.job_history: List[Dict[str, Any]] = []
        self.max_history = 100  # Keep last 100 job executions

        # Configure scheduler
        jobstores = {
            'default': MemoryJobStore()
        }
        executors = {
            'default': AsyncIOExecutor()
        }
        job_defaults = {
            'coalesce': True,  # Combine missed runs
            'max_instances': 1,  # One instance at a time
            'misfire_grace_time': 300  # 5 minutes grace period
        }

        self.scheduler = AsyncIOScheduler(
            jobstores=jobstores,
            executors=executors,
            job_defaults=job_defaults,
            timezone='UTC'
        )

        # Register built-in tasks
        self._register_builtin_tasks()

        logger.info("AutoRunnerService initialized")

    def _register_builtin_tasks(self):
        """Register built-in automated tasks"""
        self.register_task("health_check", self._task_health_check)
        self.register_task("cleanup_old_data", self._task_cleanup_old_data)
        self.register_task("analytics_update", self._task_analytics_update)
        self.register_task("batch_predictions", self._task_batch_predictions)
        self.register_task("model_health_check", self._task_model_health_check)

    def register_task(self, task_name: str, task_func: Callable):
        """Register a task function"""
        self.task_registry[task_name] = task_func
        logger.info(f"Registered task: {task_name}")

    async def _task_health_check(self):
        """Built-in task: System health check"""
        logger.info("Running health check task")
        try:
            # Add health check logic here
            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "status": "healthy",
                "message": "System health check completed"
            }
            self._add_to_history("health_check", "success", result)
            return result
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            self._add_to_history("health_check", "error", {"error": str(e)})
            raise

    async def _task_cleanup_old_data(self):
        """Built-in task: Clean up old temporary data"""
        logger.info("Running data cleanup task")
        try:
            # Add cleanup logic here
            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": "Data cleanup completed"
            }
            self._add_to_history("cleanup_old_data", "success", result)
            return result
        except Exception as e:
            logger.error(f"Data cleanup failed: {e}")
            self._add_to_history("cleanup_old_data", "error", {"error": str(e)})
            raise

    async def _task_analytics_update(self):
        """Built-in task: Update analytics and statistics"""
        logger.info("Running analytics update task")
        try:
            # Add analytics update logic here
            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": "Analytics updated successfully"
            }
            self._add_to_history("analytics_update", "success", result)
            return result
        except Exception as e:
            logger.error(f"Analytics update failed: {e}")
            self._add_to_history("analytics_update", "error", {"error": str(e)})
            raise

    async def _task_batch_predictions(self):
        """Built-in task: Run batch predictions for queued items"""
        logger.info("Running batch predictions task")
        try:
            # Add batch prediction logic here
            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": "Batch predictions completed"
            }
            self._add_to_history("batch_predictions", "success", result)
            return result
        except Exception as e:
            logger.error(f"Batch predictions failed: {e}")
            self._add_to_history("batch_predictions", "error", {"error": str(e)})
            raise

    async def _task_model_health_check(self):
        """Built-in task: Check ML model health and performance"""
        logger.info("Running model health check task")
        try:
            # Add model health check logic here
            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": "Model health check completed"
            }
            self._add_to_history("model_health_check", "success", result)
            return result
        except Exception as e:
            logger.error(f"Model health check failed: {e}")
            self._add_to_history("model_health_check", "error", {"error": str(e)})
            raise

    def _add_to_history(self, task_name: str, status: str, result: Any):
        """Add job execution to history"""
        self.job_history.append({
            "task_name": task_name,
            "status": status,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Keep only last max_history items
        if len(self.job_history) > self.max_history:
            self.job_history = self.job_history[-self.max_history:]

    async def _job_wrapper(self, task_name: str):
        """Wrapper for job execution with error handling"""
        try:
            if task_name not in self.task_registry:
                raise ValueError(f"Task {task_name} not found in registry")

            task_func = self.task_registry[task_name]
            await task_func()

        except Exception as e:
            logger.error(f"Error executing task {task_name}: {e}")
            self._add_to_history(task_name, "error", {"error": str(e)})

    def add_job(
        self,
        job_id: str,
        task_name: str,
        schedule_type: str,
        schedule_config: Dict[str, Any],
        enabled: bool = True
    ) -> Dict[str, Any]:
        """
        Add a scheduled job

        Args:
            job_id: Unique identifier for the job
            task_name: Name of the task to execute
            schedule_type: Type of schedule ('interval' or 'cron')
            schedule_config: Configuration for the schedule
            enabled: Whether the job is enabled

        Returns:
            Job information
        """
        if task_name not in self.task_registry:
            raise ValueError(f"Task {task_name} not registered")

        if not enabled:
            logger.info(f"Job {job_id} added but disabled")
            return {"job_id": job_id, "status": "disabled"}

        try:
            # Remove existing job if it exists
            if self.scheduler.get_job(job_id):
                self.scheduler.remove_job(job_id)

            # Create trigger based on schedule type
            if schedule_type == "interval":
                trigger = IntervalTrigger(**schedule_config)
            elif schedule_type == "cron":
                trigger = CronTrigger(**schedule_config)
            else:
                raise ValueError(f"Invalid schedule type: {schedule_type}")

            # Add job to scheduler
            job = self.scheduler.add_job(
                self._job_wrapper,
                trigger=trigger,
                args=[task_name],
                id=job_id,
                name=f"{task_name} ({job_id})",
                replace_existing=True
            )

            logger.info(f"Added job: {job_id} for task: {task_name}")

            return {
                "job_id": job_id,
                "task_name": task_name,
                "schedule_type": schedule_type,
                "schedule_config": schedule_config,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
                "status": "scheduled"
            }

        except Exception as e:
            logger.error(f"Error adding job {job_id}: {e}")
            raise

    def remove_job(self, job_id: str) -> Dict[str, Any]:
        """Remove a scheduled job"""
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Removed job: {job_id}")
            return {"job_id": job_id, "status": "removed"}
        except Exception as e:
            logger.error(f"Error removing job {job_id}: {e}")
            raise

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific job"""
        job = self.scheduler.get_job(job_id)
        if not job:
            return None

        return {
            "job_id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger)
        }

    def get_all_jobs(self) -> List[Dict[str, Any]]:
        """Get information about all scheduled jobs"""
        jobs = self.scheduler.get_jobs()
        return [
            {
                "job_id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            }
            for job in jobs
        ]

    def get_available_tasks(self) -> List[str]:
        """Get list of available task names"""
        return list(self.task_registry.keys())

    def get_job_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent job execution history"""
        return self.job_history[-limit:]

    async def start(self):
        """Start the auto runner scheduler"""
        if self.is_running:
            logger.warning("Auto runner is already running")
            return

        try:
            self.scheduler.start()
            self.is_running = True
            logger.info("Auto runner started successfully")
        except Exception as e:
            logger.error(f"Error starting auto runner: {e}")
            raise

    async def stop(self):
        """Stop the auto runner scheduler"""
        if not self.is_running:
            logger.warning("Auto runner is not running")
            return

        try:
            self.scheduler.shutdown(wait=True)
            self.is_running = False
            logger.info("Auto runner stopped successfully")
        except Exception as e:
            logger.error(f"Error stopping auto runner: {e}")
            raise

    def get_status(self) -> Dict[str, Any]:
        """Get auto runner status"""
        return {
            "is_running": self.is_running,
            "scheduler_state": self.scheduler.state,
            "job_count": len(self.scheduler.get_jobs()),
            "available_tasks": self.get_available_tasks(),
            "history_count": len(self.job_history)
        }


# Global instance
auto_runner = None


def get_auto_runner() -> AutoRunnerService:
    """Get the global auto runner instance"""
    global auto_runner
    if auto_runner is None:
        auto_runner = AutoRunnerService()
    return auto_runner
