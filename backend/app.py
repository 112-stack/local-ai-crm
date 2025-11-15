import os
import sys
from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize models on startup
try:
    from init_models import initialize_models
    initialize_models()
except Exception as e:
    print(f"⚠ Warning: Could not initialize models: {e}")
    print("  The application will try to create models on first use.")

# Import services
from services.predictor import PredictorService
from services.enhanced_predictor import EnhancedPredictorService
from services.risk_analyzer import RiskAnalyzer
from services.file_processor import FileProcessor
from services.config_manager import ConfigManager
from services.auto_runner import get_auto_runner

# Initialize FastAPI app
app = FastAPI(
    title="CRM Business Predictor API",
    description="AI-powered business forecasting and risk management",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
config_manager = ConfigManager()

# Try to use enhanced predictor with transformers, fallback to basic predictor
try:
    import torch
    predictor_service = EnhancedPredictorService(config_manager)
    print("✓ Using Enhanced Predictor with Transformer Models")
except Exception as e:
    print(f"⚠ Enhanced predictor unavailable, using basic predictor: {e}")
    predictor_service = PredictorService(config_manager)
    print("✓ Using Basic Predictor")

risk_analyzer = RiskAnalyzer()
file_processor = FileProcessor()
auto_runner = get_auto_runner()

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Start auto runner on application startup"""
    try:
        await auto_runner.start()
        print("✅ Auto Runner started successfully")
    except Exception as e:
        print(f"⚠ Warning: Could not start auto runner: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop auto runner on application shutdown"""
    try:
        await auto_runner.stop()
        print("✅ Auto Runner stopped successfully")
    except Exception as e:
        print(f"⚠ Warning: Error stopping auto runner: {e}")

# Pydantic models
class ApplicantData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    revenue: Optional[str] = None
    employees: Optional[str] = None
    event_type: Optional[str] = None
    budget: Optional[str] = None
    date: Optional[str] = None

class PredictionRequest(BaseModel):
    applicant_data: ApplicantData

class SettingsUpdate(BaseModel):
    useLocalGPU: Optional[bool] = None
    useOpenAI: Optional[bool] = None
    openAIKey: Optional[str] = None
    modelType: Optional[str] = None

class JobSchedule(BaseModel):
    job_id: str
    task_name: str
    schedule_type: str  # 'interval' or 'cron'
    schedule_config: dict
    enabled: bool = True

# Routes
@app.get("/")
async def root():
    return {
        "message": "CRM Business Predictor API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "gpu_available": predictor_service.gpu_available,
        "model_loaded": predictor_service.model is not None
    }

@app.get("/api/system-info")
async def get_system_info():
    import torch
    import platform

    info = {
        "python_version": platform.python_version(),
        "torch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
        "cuda_version": torch.version.cuda if torch.cuda.is_available() else None,
        "gpu_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "device": "cuda" if torch.cuda.is_available() else "cpu"
    }
    return info

@app.post("/api/predict")
async def predict(
    request: PredictionRequest,
    x_openai_key: Optional[str] = Header(None)
):
    try:
        # Update OpenAI key if provided
        if x_openai_key:
            config_manager.update_setting('openai_key', x_openai_key)

        # Convert applicant data to dict
        applicant_dict = request.applicant_data.dict()

        # Get prediction
        result = await predictor_service.predict(applicant_dict)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/risk-analysis")
async def analyze_risk(request: PredictionRequest):
    try:
        applicant_dict = request.applicant_data.dict()
        result = risk_analyzer.analyze(applicant_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-predict")
async def upload_and_predict(
    file: UploadFile = File(...),
    x_openai_key: Optional[str] = Header(None)
):
    try:
        # Update OpenAI key if provided
        if x_openai_key:
            config_manager.update_setting('openai_key', x_openai_key)

        # Save uploaded file
        file_path = await file_processor.save_upload(file)

        # Process file and extract data
        applicants = await file_processor.process_file(file_path)

        # Get predictions for all applicants
        predictions = []
        for applicant in applicants:
            try:
                result = await predictor_service.predict(applicant)
                predictions.append({
                    "applicant_data": applicant,
                    **result
                })
            except Exception as e:
                print(f"Error predicting for applicant: {e}")
                continue

        # Clean up file
        os.remove(file_path)

        return {
            "success": True,
            "count": len(predictions),
            "predictions": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings")
async def get_settings():
    return config_manager.get_all_settings()

@app.post("/api/settings")
async def update_settings(settings: SettingsUpdate):
    try:
        config_manager.update_settings(settings.dict(exclude_unset=True))

        # Reload predictor if GPU settings changed
        if settings.useLocalGPU is not None or settings.modelType is not None:
            predictor_service.reload_model()

        return {"success": True, "settings": config_manager.get_all_settings()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Auto Runner Routes
@app.get("/api/auto-runner/status")
async def get_auto_runner_status():
    """Get auto runner status"""
    try:
        return auto_runner.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auto-runner/tasks")
async def get_available_tasks():
    """Get list of available tasks"""
    try:
        return {"tasks": auto_runner.get_available_tasks()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auto-runner/jobs")
async def get_all_jobs():
    """Get all scheduled jobs"""
    try:
        return {"jobs": auto_runner.get_all_jobs()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auto-runner/jobs/{job_id}")
async def get_job(job_id: str):
    """Get specific job information"""
    try:
        job = auto_runner.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auto-runner/jobs")
async def create_job(job: JobSchedule):
    """Create a new scheduled job"""
    try:
        result = auto_runner.add_job(
            job_id=job.job_id,
            task_name=job.task_name,
            schedule_type=job.schedule_type,
            schedule_config=job.schedule_config,
            enabled=job.enabled
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/auto-runner/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete a scheduled job"""
    try:
        result = auto_runner.remove_job(job_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auto-runner/history")
async def get_job_history(limit: int = 20):
    """Get job execution history"""
    try:
        history = auto_runner.get_job_history(limit)
        return {"history": history, "count": len(history)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auto-runner/start")
async def start_auto_runner():
    """Start the auto runner"""
    try:
        await auto_runner.start()
        return {"status": "started", "message": "Auto runner started successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auto-runner/stop")
async def stop_auto_runner():
    """Stop the auto runner"""
    try:
        await auto_runner.stop()
        return {"status": "stopped", "message": "Auto runner stopped successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# In-memory storage for events and weddings (replace with database in production)
events_db = []
weddings_db = []

@app.get("/api/events")
async def get_events():
    return events_db

@app.post("/api/events")
async def create_event(event: dict):
    event['id'] = len(events_db) + 1
    events_db.append(event)
    return event

@app.delete("/api/events/{event_id}")
async def delete_event(event_id: int):
    global events_db
    events_db = [e for e in events_db if e.get('id') != event_id]
    return {"success": True}

@app.get("/api/weddings")
async def get_weddings():
    return weddings_db

@app.post("/api/weddings")
async def create_wedding(wedding: dict):
    wedding['id'] = len(weddings_db) + 1
    weddings_db.append(wedding)
    return wedding

@app.delete("/api/weddings/{wedding_id}")
async def delete_wedding(wedding_id: int):
    global weddings_db
    weddings_db = [w for w in weddings_db if w.get('id') != wedding_id]
    return {"success": True}

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))

    print(f"""
    ╔════════════════════════════════════════╗
    ║  CRM Business Predictor API Server    ║
    ╚════════════════════════════════════════╝

    🚀 Server starting...
    📍 URL: http://{host}:{port}
    🔧 GPU: {'Available' if predictor_service.gpu_available else 'Not Available (CPU Mode)'}

    """)

    uvicorn.run(app, host=host, port=port)
