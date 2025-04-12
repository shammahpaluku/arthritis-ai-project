#!/usr/bin/env python3

import requests
import os
import json
import readline  # Enables up/down arrows + history

API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not API_KEY:
    print("❌ Please set your ANTHROPIC_API_KEY environment variable.")
    exit(1)

headers = {
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
}

messages = []

print("🧠 Claude CLI — type 'exit' or 'quit' to leave")
print("---------------------------------------------")

while True:
    try:
        user_input = input("claude > ").strip()
        if user_input.lower() in ["exit", "quit"]:
            print("👋 Exiting Claude CLI.")
            break
        if not user_input:
            continue

        messages.append({"role": "user", "content": user_input})

        payload = {
            "model": "claude-3-opus-20240229",  # Change to `sonnet` if needed
            "max_tokens": 1024,
            "messages": messages
        }

        response = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)

        if response.status_code != 200:
            print(f"❌ Error {response.status_code}: {response.text}")
            continue

        reply = response.json()["content"][0]["text"].strip()
        print(f"\nClaude:\n{reply}\n")
        messages.append({"role": "assistant", "content": reply})

    except KeyboardInterrupt:
        print("\n👋 Interrupted. Exiting.")
        break
    except Exception as e:
        print("❌ Unexpected error:", e)
