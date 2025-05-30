

# This code derives from the Hugging Face https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B?library=transformers 
# for the DeepSeek-R1-Distill-Qwen-1.5B (distilled version of DeepSeek-R1) model.
# My purpose for using this model is to make code that runs on my smaller machine or on cheaper/free cloud services.
# Perhaps later, the same code can be ran on rented GPUs with the full DeepSeek-R1 model by simply erasing "-Distill-Qwen-1.5B" from the model name.
# Or perhaps this plan is too expensive/ambitious or another plan reveals itself as better.
# This is a basic implementation. There is more that can be done to improve this, like (for starters) perhaps a command line interface for the user to input their own messages.

# pipelines as a helper is simpler than the other example
from transformers import pipeline
import torch

# print("CUDA available:", torch.cuda.is_available())
# print("Number of GPUs:", torch.cuda.device_count())
# print("GPU name: ", torch.cuda.get_device_name(0))

messages = [
    {"role": "user", "content": "Compare this distilled DeepSeek-R1 to the larger R1?"},
] # role gives context to the model and content is the prompt

pipe = pipeline("text-generation", model="deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B", max_new_tokens=250, device=0) 
# device 0 uses the GPU, -1 (or default) uses the CPU
# max_new_tokens is the maximum length of the output

output = pipe(messages)

print(output)

# command line input and output:

# $ time python3 r1Distilled.py
# [{'generated_text': [{'role': 'user', 'content': 'Compare this distilled DeepSeek-R1 to the larger R1?'}, {'role': 'assistant', 'content': '<think>\n\n</think>\n\nDeepSeek-R1 is designed with a deep learning architecture to tackle complex tasks, while R1 is a more general AI model. Both are powerful tools in their respective domains.'}]}]

# real    0m5.709s
# user    0m6.462s
# sys     0m3.008s
