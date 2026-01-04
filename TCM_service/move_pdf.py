import os
import glob
import shutil

files = glob.glob("Final*.pdf")
if files:
    src = files[0]
    dst = "tcm-exam-herb-ai-assistant/public/project_presentation.pdf"
    print(f"Moving {src} to {dst}")
    try:
        shutil.move(src, dst)
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No file found matching Final*.pdf")
