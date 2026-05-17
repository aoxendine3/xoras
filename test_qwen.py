import os
from openai import OpenAI
import sys

api_key = "sk-53a0eec8e9c94f6ea0ce3e08106fb496"
regions = [
    "https://dashscope-us.aliyuncs.com/compatible-mode/v1",
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    "https://dashscope.aliyuncs.com/compatible-mode/v1"
]

for region_url in regions:
    print(f"Testing Region: {region_url}")
    client = OpenAI(api_key=api_key, base_url=region_url)
    try:
        completion = client.chat.completions.create(
            model="qwen-plus",
            messages=[{"role": "user", "content": "Hello! Respond with 'XORAS INTELLIGENCE ACTIVE'."}]
        )
        print(f"SUCCESS on {region_url}: {completion.choices[0].message.content}")
        sys.exit(0)
    except Exception as e:
        print(f"FAILED on {region_url}: {e}")
