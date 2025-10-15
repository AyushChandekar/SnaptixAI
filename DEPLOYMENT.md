# SnaptixAI Deployment Guide

## Project Overview
SnaptixAI is a dementia screening application with:
- **Frontend**: React + TypeScript + Vite application
- **Backend**: FastAPI Python application with ML capabilities

## Prerequisites
- Node.js 18+ for frontend development
- Python 3.10+ for backend development
- Git for version control

## Local Development

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
uvicorn app:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend Deployment on Render

1. **Push to GitHub** (this step you've already completed)

2. **Deploy on Render**:
   - Visit [render.com](https://render.com) and sign up/login
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `https://github.com/AyushChandekar/SnaptixAI`
   - Configure the service:
     - **Name**: `snaptix-ai-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `cd backend && pip install -r requirements.txt && python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"`
     - **Start Command**: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free tier is fine for testing

3. **Environment Variables** (Add in Render dashboard):
   - `PYTHON_VERSION`: `3.10.0`
   - `OPENAI_API_KEY`: (your OpenAI API key if using)
   - `HF_TOKEN`: (your HuggingFace token if needed)

4. **Health Check**: Render will automatically check `/health` endpoint

### Frontend Deployment on Vercel

1. **Deploy on Vercel**:
   - Visit [vercel.com](https://vercel.com) and sign up/login
   - Click "New Project"
   - Import your GitHub repository: `https://github.com/AyushChandekar/SnaptixAI`
   - Configure the project:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build` (auto-detected)
     - **Output Directory**: `dist` (auto-detected)

2. **Environment Variables** (Add in Vercel dashboard):
   - `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com`
   - Replace with your actual Render backend URL

3. **Custom Domain** (Optional):
   - Add your custom domain in Vercel dashboard
   - Configure DNS records as instructed

## Environment Configuration

### Backend (.env file)
```env
# OpenAI API (if using)
OPENAI_API_KEY=your_openai_api_key_here

# HuggingFace API (if using)
HF_TOKEN=your_huggingface_token_here

# Environment
ENVIRONMENT=production
```

### Frontend (.env file)
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

## Post-Deployment

1. **Test the backend**: Visit your Render URL + `/health`
2. **Test the frontend**: Visit your Vercel URL
3. **Update CORS**: In `backend/app.py`, update CORS origins to include your frontend URL
4. **Monitor**: Check logs in both Render and Vercel dashboards

## Troubleshooting

### Backend Issues
- Check Render logs for Python/dependency errors
- Ensure all environment variables are set
- Verify health check endpoint is responding
- Check if all required system packages are available

### Frontend Issues
- Verify environment variables are prefixed with `VITE_`
- Check browser console for API connection errors
- Ensure backend URL is correctly configured
- Check network tab for failed API calls

### Common Problems
1. **CORS errors**: Update backend CORS settings
2. **Build failures**: Check Node.js/Python versions
3. **API timeouts**: Increase timeout limits in Render
4. **Large file errors**: Ensure proper .gitignore is in place

## Monitoring and Maintenance

- **Render**: Monitor CPU/memory usage, response times
- **Vercel**: Check build times, edge function performance
- **Regular updates**: Keep dependencies updated
- **Security**: Rotate API keys regularly

## Scaling Considerations

### Backend
- Upgrade Render plan for more resources
- Consider Redis for session management
- Implement database for persistent storage
- Add rate limiting and authentication

### Frontend
- Enable Vercel Analytics
- Implement CDN for static assets
- Add error tracking (Sentry)
- Optimize bundle size

## Support
For issues related to deployment, check the respective platform documentation:
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)