import os
import time
import requests
import argparse
from typing import Optional

try:
    import dashscope
    from dashscope import VideoSynthesis
except ImportError:
    print("FATAL: dashscope SDK not found. Execute: pip install dashscope")
    exit(1)

def generate_sovereign_video(api_key: str, prompt: str, model_version: str = 'wan2.6-t2v', region: str = 'intl') -> Optional[str]:
    """
    XORAS SYSTEMS LLC - Alibaba Cloud Video Generation Sentry
    Architects high-fidelity institutional videos via the DashScope API.
    """
    dashscope.api_key = api_key
    
    # Configure regional endpoints
    if region == 'intl':
        dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'
    else:
        dashscope.base_http_api_url = 'https://dashscope.aliyuncs.com/api/v1'
        
    print(f"================================================================")
    print(f" 🌐 XORAS SYSTEMS LLC - SOVEREIGN VIDEO GENERATION ENGINE")
    print(f"================================================================")
    print(f"Model: {model_version}")
    print(f"Endpoint: {dashscope.base_http_api_url}")
    print(f"Payload: {prompt}")
    print(f"Status: Submitting execution payload to Alibaba Cloud...")
    
    try:
        # Submit asynchronous video generation task
        response = VideoSynthesis.call(
            model=model_version,
            prompt=prompt,
            size='1920*1080',
            prompt_extend=True
        )
        
        if response.status_code != 200:
            print(f"Error [{response.code}]: {response.message}")
            return None
            
        task_id = response.output.task_id
        print(f"✓ Task Accepted. ID: [ {task_id} ]")
        print(f"Status: Executing asynchronous render. Polling for finality...")
        
        # Poll for completion
        while True:
            time.sleep(15) # Wait 15 seconds between polls
            status_response = VideoSynthesis.fetch(task_id)
            
            if status_response.status_code != 200:
                print(f"Error [{status_response.code}]: {status_response.message}")
                return None
                
            task_status = status_response.output.task_status
            
            if task_status == 'SUCCEEDED':
                video_url = status_response.output.video_url
                print(f"✓ Video Render Complete. Finality Achieved.")
                return video_url
                
            elif task_status == 'FAILED':
                print(f"Error: Render Failed. {status_response.output.message}")
                return None
                
            else:
                print(f"  ... rendering ({task_status})")
                
    except Exception as e:
        print(f"Exception encountered during execution: {str(e)}")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="XORAS Video Generation Engine")
    parser.add_argument("--key", required=True, help="Alibaba Cloud DashScope API Key")
    parser.add_argument("--prompt", required=True, help="Video Generation Prompt")
    args = parser.parse_args()
    
    url = generate_sovereign_video(args.key, args.prompt)
    if url:
        print(f"Download URL: {url}")
        print(f"================================================================")
