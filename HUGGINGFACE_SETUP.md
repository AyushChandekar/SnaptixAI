# Get Free HuggingFace API Token

## Step 1: Create Account
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up for a free account

## Step 2: Generate API Token
1. Click your profile picture → **Settings**
2. Go to **Access Tokens**
3. Click **New token**
4. Name: `SnaptixAI-Whisper`
5. Type: **Read**
6. Click **Generate**
7. Copy the token (starts with `hf_...`)

## Step 3: Add to Render
1. Go to [render.com](https://render.com) dashboard
2. Open your **snaptixai** service
3. Go to **Environment** tab
4. Add new variable:
   - **Key**: `HUGGINGFACE_API_KEY`
   - **Value**: `hf_your_token_here`
5. Click **Save** (service will auto-redeploy)

## Benefits
- **Free**: 1000 requests/month
- **No billing required**
- **Good quality**: Whisper large-v3 model
- **Auto fallback**: If quota exceeded, uses mock data

## Test
After adding the token, test by recording again. Check Render logs for:
```
INFO:transcriber:Used HuggingFace for transcription
```

Instead of:
```
INFO:transcriber:Used mock transcription for demo
```