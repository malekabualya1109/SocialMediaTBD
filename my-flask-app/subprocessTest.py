# subprocess test file


import os
import subprocess
parent_directory = os.path.abspath(os.path.join(os.getcwd(), ".."))
bot_path = os.path.join(parent_directory, "LlamaRolePlay5.py")

bot_arg1 =  "You are a friendly and helpful chatbot that assists users on a social media app."
bot_arg2 = "Unknown User"
bot_arg3 = "What is the capital of Algoria?"

bot_output = subprocess.run(
    ["python3", bot_path, bot_arg1, bot_arg2, bot_arg3],
    capture_output=True,
    text=True,
    cwd=parent_directory
)
bot_reply = bot_output.stdout.strip()

print ("Bot output:", bot_reply)