# CogniScreen AI Backend

FastAPI-based backend service for early-stage dementia detection through speech analysis.

## 🚀 Features

- **Speech Transcription**: Supports OpenAI Whisper, HuggingFace APIs, and mock transcription
- **Heuristic Analysis**: Advanced speech pattern analysis using linguistic features
- **Risk Assessment**: Calculates dementia risk scores based on multiple speech metrics
- **Comprehensive API**: RESTful endpoints with proper error handling and validation

## 📋 Requirements

- Python 3.9+
- Audio processing libraries (librosa, soundfile)
- FastAPI and dependencies
- Optional: OpenAI API key, HuggingFace API key

## 🔧 Setup

### Local Development

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (optional)
   ```

4. **Run the server**:
   ```bash
   python app.py
   # Or: uvicorn app:app --reload
   ```

The server will start at `http://localhost:8000`

### API Documentation

Once running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Transcribe Audio
```http
POST /transcribe
Content-Type: multipart/form-data
```
**Body**: Audio file (wav, mp3, webm, etc.)

**Response**:
```json
{
  "transcript": "transcribed text...",
  "duration": 30.5,
  "confidence": 0.95
}
```

### Analyze Speech
```http
POST /analyze
Content-Type: application/json
```
**Body**:
```json
{
  "transcript": "speech text to analyze",
  "metadata": {
    "duration": 30.5,
    "fileSize": 1024000
  }
}
```

**Response**:
```json
{
  "riskScore": 25,
  "explanation": "Speech patterns appear normal...",
  "metrics": {
    "speechRate": 145.2,
    "pauseCount": 3,
    "vocabularyRichness": 0.75,
    "fluencyScore": 8.5
  }
}
```

## 🧠 Analysis Features

### Speech Metrics
- **Speech Rate**: Words per minute analysis
- **Pause Detection**: Hesitation and silence patterns
- **Vocabulary Richness**: Type-token ratio and diversity
- **Fluency Score**: Overall speech fluency assessment

### Risk Factors
- Slow speech rate (< 80 WPM)
- Excessive pauses (> 10 instances)
- Low vocabulary diversity (< 40% unique words)
- Word-finding difficulties
- Repetitive speech patterns

### Heuristic Rules
- Evidence-based thresholds for each metric
- Weighted scoring system
- Interpretable explanations
- Confidence levels

## 🚀 Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `OPENAI_API_KEY` (optional)
   - `HUGGINGFACE_API_KEY` (optional)
3. Deploy automatically with `railway.json` configuration

### Docker Deployment

```bash
docker build -t cogniscreen-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key cogniscreen-backend
```

### HuggingFace Spaces

1. Create new Space with Docker SDK
2. Upload repository files
3. Configure secrets in Space settings
4. Space will auto-deploy

## 🔒 Environment Variables

```bash
# Optional API Keys
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...

# Server Config
HOST=0.0.0.0
PORT=8000
DEBUG=False

# CORS
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Test with audio file
curl -X POST -F "audio=@sample.wav" http://localhost:8000/transcribe
```

### Sample Analysis
The system includes realistic mock transcriptions for demo purposes when API keys are not provided.

## 📊 Performance

- Transcription: 1-5 seconds (depending on API)
- Analysis: < 100ms for typical speech samples
- Memory usage: ~200MB base + model loading
- Concurrent requests: Supports multiple simultaneous analyses

## ⚠️ Limitations

- **Demo Purpose**: Not for medical diagnosis
- **Language**: Currently optimized for English
- **Audio Quality**: Best results with clear, single-speaker audio
- **Internet Required**: For API-based transcription services

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - Multi-API transcription support
  - Comprehensive heuristic analysis
  - REST API with full documentation
  - Docker and cloud deployment ready

## 📄 License

Built for SIH 2024 Hackathon - Educational/Research purposes only.