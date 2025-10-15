import os

# Read the .env file manually
try:
    with open('.env', 'r', encoding='utf-8') as f:
        content = f.read().strip()
        print(f"File content: {content}")
        
        # Parse the key-value pair
        if '=' in content:
            key, value = content.split('=', 1)
            os.environ[key] = value
            print(f"Set {key} = {value[:8]}...")
        else:
            print("No = found in .env file")
            
except Exception as e:
    print(f"Error reading .env file: {e}")

# Test if we can access the API key
api_key = os.getenv("HUGGINGFACE_API_KEY")
print(f"API Key loaded: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"Key starts with: {api_key[:8]}...")
    print(f"Key length: {len(api_key)}")
    
    if api_key.startswith('hf_'):
        print("✅ API key format looks correct!")
    else:
        print("❌ API key should start with 'hf_'")
else:
    print("❌ No API key found")