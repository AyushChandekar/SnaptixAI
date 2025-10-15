from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import logging
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import analysis modules
from speech_analyzer import SpeechAnalyzer
from transcriber import TranscriptionService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CogniScreen AI Backend",
    description="Early-Stage Dementia Detection API",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo purposes - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class AnalysisRequest(BaseModel):
    transcript: str
    metadata: Dict[str, Any] = {}

class TranscriptionResponse(BaseModel):
    transcript: str
    duration: float
    confidence: float = 0.95

class AnalysisResponse(BaseModel):
    riskScore: int
    explanation: str
    metrics: Dict[str, float]

# Initialize services
transcription_service = TranscriptionService()
speech_analyzer = SpeechAnalyzer()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CogniScreen AI Backend",
        "version": "1.0.0"
    }

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio file to text using HuggingFace/OpenAI Whisper
    """
    try:
        logger.info(f"Processing audio file: {audio.filename}")
        logger.info(f"Content type: {audio.content_type}")
        logger.info(f"File size: {audio.size if hasattr(audio, 'size') else 'unknown'} bytes")
        
        # Validate audio file
        if not audio.content_type or not audio.content_type.startswith('audio/'):
            if audio.content_type not in ['application/octet-stream']:  # Allow binary uploads
                raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")
        
        # Create temporary file with appropriate extension
        # Detect file format from content type first, then filename
        file_ext = ".wav"  # default
        if audio.content_type:
            if 'webm' in audio.content_type:
                file_ext = ".webm"
            elif 'mp4' in audio.content_type:
                file_ext = ".mp4"
            elif 'ogg' in audio.content_type:
                file_ext = ".ogg"
            elif 'm4a' in audio.content_type:
                file_ext = ".m4a"
        elif audio.filename:
            if audio.filename.endswith('.webm'):
                file_ext = ".webm"
            elif audio.filename.endswith('.mp4'):
                file_ext = ".mp4"
            elif audio.filename.endswith('.m4a'):
                file_ext = ".m4a"
            elif audio.filename.endswith('.ogg'):
                file_ext = ".ogg"
        
        logger.info(f"Detected file extension: {file_ext}")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            content = await audio.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
            
        logger.info(f"Saved audio to temporary file: {tmp_path}")
        
        try:
            # Transcribe the audio
            result = await transcription_service.transcribe(tmp_path)
            
            logger.info(f"Transcription completed: {len(result['transcript'])} characters")
            
            return TranscriptionResponse(
                transcript=result['transcript'],
                duration=result['duration'],
                confidence=result.get('confidence', 0.95)
            )
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_speech(request: AnalysisRequest):
    """
    Analyze transcript for dementia risk indicators using heuristic rules
    """
    try:
        logger.info(f"Analyzing transcript: {len(request.transcript)} characters")
        
        if not request.transcript.strip():
            raise HTTPException(status_code=400, detail="Transcript cannot be empty")
        
        # Perform speech analysis
        analysis_result = speech_analyzer.analyze(
            transcript=request.transcript,
            metadata=request.metadata
        )
        
        logger.info(f"Analysis completed. Risk score: {analysis_result['riskScore']}")
        
        return AnalysisResponse(
            riskScore=analysis_result['riskScore'],
            explanation=analysis_result['explanation'],
            metrics=analysis_result['metrics']
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error: {str(exc)}")
    return {
        "error": "Internal server error",
        "detail": str(exc)
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
