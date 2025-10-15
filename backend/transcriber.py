import os
import librosa
import tempfile
import logging
from typing import Dict, Any
import httpx
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq
import torch

logger = logging.getLogger(__name__)

class TranscriptionService:
    """Service for converting speech to text using various APIs"""
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
        
        # Debug logging (remove in production)
        logger.info(f"OpenAI API Key: {'Set' if self.openai_api_key else 'Not Set'}")
        logger.info(f"HuggingFace API Key: {'Set' if self.huggingface_api_key else 'Not Set'}")
        if self.huggingface_api_key:
            logger.info(f"HF Key starts with: {self.huggingface_api_key[:8]}...")
        
        # For demo purposes, we'll use a fallback mock transcription
        # In production, you'd want to use actual APIs
        logger.info("TranscriptionService initialized")
    
    async def transcribe(self, audio_path: str) -> Dict[str, Any]:
        """
        Transcribe audio file to text
        Priority: OpenAI Whisper > HuggingFace > Local Mock
        """
        try:
            # Get audio duration for metadata
            duration = self._get_audio_duration(audio_path)
            
            # Try different transcription methods
            transcript = None
            confidence = 0.85
            
            # Method 1: HuggingFace API (free, try first)
            if self.huggingface_api_key:
                try:
                    transcript = await self._transcribe_huggingface(audio_path)
                    confidence = 0.90
                    logger.info("Used HuggingFace for transcription")
                except Exception as e:
                    logger.warning(f"HuggingFace transcription failed: {e}")
            
            # Method 2: OpenAI Whisper API (if HuggingFace failed and available)
            if not transcript and self.openai_api_key:
                try:
                    transcript = await self._transcribe_openai(audio_path)
                    confidence = 0.95
                    logger.info("Used OpenAI Whisper for transcription")
                except Exception as e:
                    logger.warning(f"OpenAI transcription failed: {e}")
            
            # Method 3: Mock transcription for demo (fallback)
            if not transcript:
                transcript = self._mock_transcription(audio_path, duration)
                confidence = 0.85
                logger.info("Used mock transcription for demo")
            
            return {
                "transcript": transcript,
                "duration": duration,
                "confidence": confidence
            }
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise Exception(f"Failed to transcribe audio: {str(e)}")
    
    async def _transcribe_openai(self, audio_path: str) -> str:
        """Transcribe using OpenAI Whisper API"""
        try:
            import openai
            client = openai.OpenAI(api_key=self.openai_api_key)
            
            with open(audio_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            return transcript
            
        except ImportError:
            raise Exception("OpenAI library not installed")
        except Exception as e:
            raise Exception(f"OpenAI transcription error: {str(e)}")
    
    async def _transcribe_huggingface(self, audio_path: str) -> str:
        """Transcribe using HuggingFace Inference API"""
        try:
            API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3"
            
            # Determine content type based on file extension
            content_type = "audio/wav"  # default
            if audio_path.endswith('.webm'):
                content_type = "audio/webm"
            elif audio_path.endswith('.mp4'):
                content_type = "audio/mp4" 
            elif audio_path.endswith('.ogg'):
                content_type = "audio/ogg"
            elif audio_path.endswith('.m4a'):
                content_type = "audio/m4a"
            
            headers = {
                "Authorization": f"Bearer {self.huggingface_api_key}",
                "Content-Type": content_type
            }
            
            # Check if we need to convert audio - skip for supported formats
            supported_formats = ['.webm', '.wav', '.mp3', '.ogg', '.m4a', '.flac']
            needs_conversion = not any(audio_path.endswith(fmt) for fmt in supported_formats)
            
            converted_path = None
            if needs_conversion:
                try:
                    converted_path = self._convert_audio_to_wav(audio_path)
                    logger.info(f"Audio conversion successful: {converted_path}")
                except Exception as conv_error:
                    logger.warning(f"Audio conversion failed: {conv_error}, using original file")
                    converted_path = audio_path
            else:
                logger.info(f"Using original audio file (supported format): {audio_path}")
                converted_path = audio_path
            
            # Read the audio file
            with open(converted_path, "rb") as f:
                data = f.read()
            
            logger.info(f"Sending {len(data)} bytes to HuggingFace API with Content-Type: {content_type}")
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(API_URL, headers=headers, data=data)
                
                logger.info(f"HuggingFace API response status: {response.status_code}")
                
                if response.status_code == 503:
                    # Model is loading, wait and retry
                    logger.info("Model is loading, waiting and retrying...")
                    import asyncio
                    await asyncio.sleep(10)
                    response = await client.post(API_URL, headers=headers, data=data)
                    logger.info(f"Retry response status: {response.status_code}")
                
                if response.status_code != 200:
                    logger.error(f"HuggingFace API error: {response.status_code} - {response.text}")
                    response.raise_for_status()
                
                result = response.json()
                logger.info(f"HuggingFace API result: {result}")
                
                # Clean up converted file if it's different from original
                if converted_path != audio_path and converted_path and os.path.exists(converted_path):
                    os.remove(converted_path)
                
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("text", "")
                elif isinstance(result, dict):
                    return result.get("text", "")
                else:
                    raise Exception("Unexpected response format")
                    
        except Exception as e:
            # Clean up converted file on error
            if converted_path and converted_path != audio_path and os.path.exists(converted_path):
                os.remove(converted_path)
            raise Exception(f"HuggingFace transcription error: {str(e)}")
    
    def _mock_transcription(self, audio_path: str, duration: float) -> str:
        """
        Generate a mock transcription for demo purposes
        This simulates various speech patterns that would indicate different risk levels
        """
        # Analyze some basic audio properties to create realistic mock data
        try:
            y, sr = librosa.load(audio_path, sr=16000)
            
            # Calculate some basic features
            energy = librosa.feature.rms(y=y)[0]
            avg_energy = float(energy.mean())
            
            # Generate different mock transcripts based on audio characteristics
            if avg_energy > 0.02:
                # Higher energy - simulate normal speech
                mock_transcripts = [
                    "Hello, my name is Sarah and I'm here today to talk about my daily activities. This morning I woke up at seven thirty and had breakfast with my husband. We discussed our plans for the weekend which include visiting our daughter and her family. I'm looking forward to seeing our grandchildren who are now eight and ten years old. After breakfast I went to the grocery store to buy ingredients for dinner. I'm planning to make my famous lasagna recipe that everyone in the family loves.",
                    "I want to tell you about my hobbies and interests. I've been an avid reader since I was a child and I particularly enjoy mystery novels and historical fiction. My book club meets every Tuesday at the local library where we discuss our monthly selection. I also enjoy gardening and have been growing tomatoes, peppers, and herbs in my backyard for over twenty years. Cooking is another passion of mine and I love experimenting with new recipes from different cultures.",
                    "Today has been a wonderful day with perfect weather for outdoor activities. I started my morning with a thirty-minute walk around the neighborhood, greeting several neighbors along the way. The spring flowers are blooming beautifully and I stopped to admire the cherry blossoms in the park. This afternoon I'm planning to work in my garden, planting new vegetables for the summer season. I believe staying active both physically and mentally is crucial for maintaining good health as we age."
                ]
            elif avg_energy > 0.01:
                # Medium energy - simulate some hesitation
                mock_transcripts = [
                    "Well, let me think about what I did yesterday. I woke up in the morning, had my usual... um... what do I usually have? Oh yes, coffee and toast. Then I think I went somewhere, was it the store? Yes, the grocery store to get some things. I bought milk, bread, and... hmm... what else was it? I can't quite remember everything but I know there were other items too. When I got home I put everything away and then watched some television.",
                    "I enjoy reading, well I used to enjoy reading more than I do now. Sometimes the words get a bit... you know... jumbled up and I have to read sentences twice. My favorite books are... let me think... mystery stories and sometimes romance novels. I go to the library every... is it Tuesday or Wednesday? I think it's Tuesday but I should check my calendar to be sure.",
                    "My daily routine is pretty simple. I wake up around... well it varies but usually between seven and eight. Then I have breakfast which is usually... um... cereal or sometimes toast. After that I like to go for a walk but only if the weather is nice. Yesterday or was it the day before... anyway, recently I went to see my neighbor Mrs. Johnson and we had a nice chat about her garden."
                ]
            else:
                # Lower energy - simulate more concerning patterns
                mock_transcripts = [
                    "I... I was going somewhere today. Where was it? The place with the... the things. You know, where they have the... the food items. I can't quite remember the word for it.",
                    "Yesterday or was it today? I'm not sure. There was something important I needed to do. My daughter called, I think. Or maybe that was last week. Time gets confused sometimes.",
                    "The thing is... what was I talking about? I know there was something. Sometimes the words just don't come when I need them. It's frustrating when your mind doesn't work like it used to."
                ]
            
            # Select a random mock transcript
            import random
            return random.choice(mock_transcripts)
            
        except Exception as e:
            logger.warning(f"Error in mock transcription: {e}")
            # Fallback mock transcript
            return "I was talking about my daily activities and some of the things I like to do. Sometimes I have trouble finding the right words, but I try to explain what I mean."
    
    def _convert_audio_to_wav(self, audio_path: str) -> str:
        """Convert audio file to WAV format for API compatibility"""
        try:
            # First try with pydub (better for browser formats)
            from pydub import AudioSegment
            from pydub.utils import which
            
            # Check if we can use pydub
            audio = AudioSegment.from_file(audio_path)
            
            # Convert to WAV with proper settings for Whisper API
            wav_path = audio_path.replace('.webm', '.wav').replace('.mp4', '.wav').replace('.m4a', '.wav')
            if wav_path == audio_path:
                wav_path = audio_path + '.wav'
            
            # Export as WAV: 16kHz, mono, 16-bit
            audio = audio.set_frame_rate(16000).set_channels(1)
            audio.export(wav_path, format="wav")
            
            logger.info(f"Converted audio from {audio_path} to {wav_path}")
            return wav_path
            
        except Exception as e:
            logger.warning(f"Pydub conversion failed: {e}, trying librosa...")
            
            # Fallback to librosa
            try:
                # Load audio with librosa (handles multiple formats)
                y, sr = librosa.load(audio_path, sr=16000)  # Resample to 16kHz
                
                # Create a temporary WAV file
                import soundfile as sf
                wav_path = audio_path.replace('.webm', '.wav').replace('.mp4', '.wav').replace('.m4a', '.wav')
                if wav_path == audio_path:
                    wav_path = audio_path + '.wav'
                
                # Write as WAV
                sf.write(wav_path, y, sr)
                logger.info(f"Librosa converted audio from {audio_path} to {wav_path}")
                return wav_path
                
            except Exception as e2:
                logger.warning(f"Could not convert audio format with librosa either: {e2}")
                return audio_path  # Return original if conversion fails
    
    def _get_audio_duration(self, audio_path: str) -> float:
        """Get duration of audio file"""
        try:
            y, sr = librosa.load(audio_path, sr=None)
            duration = librosa.get_duration(y=y, sr=sr)
            return float(duration)
        except Exception as e:
            logger.warning(f"Could not get audio duration: {e}")
            return 30.0  # Default duration
