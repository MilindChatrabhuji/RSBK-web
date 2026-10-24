#!/usr/bin/env python3
"""
RSBK Online — Antigravity Brain Context Restore Script
Author: Dr. Milind Chatrabhuji / Antigravity
Purpose:
  Restores the full conversation context, transcript, uploaded media,
  and task history to the local Antigravity environment on your home laptop.
"""

import os
import sys
import zipfile
import shutil

CONVERSATION_ID = "b499811b-2f39-4e2b-957c-38857550e8c0"

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    zip_path = os.path.join(script_dir, "brain_backup", "rsbk_brain_full_backup.zip")

    if not os.path.exists(zip_path):
        print(f"❌ Backup archive not found at: {zip_path}")
        sys.exit(1)

    # Resolve target Antigravity brain path
    user_home = os.path.expanduser("~")
    target_dir = os.path.join(user_home, ".gemini", "antigravity", "brain", CONVERSATION_ID)

    print("==================================================================")
    print(" RSBK Online — Restoring Antigravity Conversation Context")
    print("==================================================================")
    print(f" Source archive : {zip_path}")
    print(f" Target folder  : {target_dir}")
    print()

    os.makedirs(target_dir, exist_ok=True)

    print(" Extracting files... (this may take a few seconds)")
    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(target_dir)
        print()
        print(" SUCCESS! Context fully restored.")
        print(" Conversation ID :", CONVERSATION_ID)
        print(" Location        :", target_dir)
        print(" You can now launch Antigravity on this laptop and resume immediately")
        print(" with complete memory of all previous tasks, decisions, and files.")
        print("==================================================================")
    except Exception as e:
        print(f"❌ Failed to extract archive: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
