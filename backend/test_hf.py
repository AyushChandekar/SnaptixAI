import os
import asyncio
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_hf_api():
    api_key = os.getenv("HUGGINGFACE_API_KEY")
    
    print(f"API Key loaded: {'Yes' if api_key else 'No'}")
    if api_key:
        print(f"Key starts with: {api_key[:8]}...")
    
    if not api_key or api_key == "hf_your_token_here":
        print("❌ ERROR: No valid API key found!")
        print("Please update your .env file with a real HuggingFace token")
        return
    
    # Test API call
    API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    print("Testing HuggingFace API connection...")
    
    try:
        async with httpx.AsyncClient() as client:
            # Test with a small audio file (just to check connection)
            response = await client.post(API_URL, headers=headers, data=b"dummy")
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ API connection successful!")
            elif response.status_code == 401:
                print("❌ Authentication failed - check your API key")
            elif response.status_code == 400:
                print("✅ API key valid (got expected 400 error for dummy data)")
            else:
                print(f"❌ Unexpected response: {response.text}")
                
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    asyncio.run(test_hf_api())