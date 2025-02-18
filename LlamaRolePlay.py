# This code starts from CommandLineBot.py and uses "meta-llama/Llama-3.2-1B-Instruct" as the model name instead of "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
# The "meta-llama/Llama-3.2-1B-Instruct" model seems to output more seemless responses than the deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B" model

# This code adds in the additional functionality of giving the assistant a persona by passing in a "role" via command line arguments
# It wasn't just as simple as switching out the model name. It also required changing the way the messages were formatted and the way the assistant's response was extracted.

from transformers import pipeline # pipeline is used to generate responses
import sys # sys.argv is used to get command line arguments
import re # re.split is used to split the string at a certain point
import logging # logging is used to suppress unwanted logging output

# Suppress unwanted logging output
logging.getLogger("transformers").setLevel(logging.ERROR) # Do not show WARNING messages; only show ERROR messages
# for directions on how to use this function, go to https://docs.python.org/3/library/logging.html#logging.basicConfig
# for directions on how to use the setLevel function, go to https://docs.python.org/3/library/logging.html#logging.Logger.setLevel
# for explaination of logging.ERROR, go to https://docs.python.org/3/library/logging.html#logging-levels


# Model selection
model_name = "meta-llama/Llama-3.2-1B-Instruct"
# This bot uses the "meta-llama/Llama-3.2-1B-Instruct" model, provided by Meta.  
# See [Meta’s model page](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct) and [LICENSE](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct/blob/main/LICENSE.txt) for terms of use.


# Get user input
prompt1 = sys.argv[1] # to assign system a role
prompt2 = sys.argv[2] # to assign a name to the user
prompt3 = sys.argv[3] # the input message from the user
if prompt1 == "-train":
    exit()

# Construct message format
messages = [

    {"role": "system", "content": prompt1},
    {"role": prompt2, "content": prompt3},
]

# Load model pipeline
pipe = pipeline(
    "text-generation", 
    model=model_name, 
    max_new_tokens=250, 
    device=0
)
    # device 0 uses the GPU, -1 (or default) uses the CPU
    # max_new_tokens is the maximum length of the output

pipe.tokenizer.pad_token = pipe.tokenizer.eos_token  # Suppress padding warning from output. The output was indicating a need and giving hints that lead to this line of code with:
# Specific warning message: "Setting `pad_token_id` to `eos_token_id`:None for open-end generation."
# GPT-2 and Llama models require padding to be set to the end of the sequence token
# Here is one source: https://huggingface.co/transformers/main_classes/tokenizer.html#transformers.PreTrainedTokenizer.pad_token 
# But this Youtube video explains it better: https://www.youtube.com/watch?v=QbDnCNc6alw:
# pad_token is used to fill shorter sequences in a batch to match the longest sequence in batch, ensuring uniform input size for model processes. 
# Using same token for padding and end of sequence that is eos_token. This is a technique employed sometimes to reduce complexity of output space...
# This approach uses one token to solve two purposes: indicate end of meaningful content and padding to match the length of a longer sequence in a batch.
# Meaning of tokenizer.pad_token equal tokenizer.eos_token | Large Language Models (LLMs): https://www.youtube.com/watch?v=QbDnCNc6alw
# From this https://www.youtube.com/watch?v=QbDnCNc6alw video, to help explain:

# Suppose we have the following two sentences in our training dataset:

# 1. "Hello, how are you?"
# 2. "I am fine."
# When tokenized and prepared for model training, each sentence might end with an EOS token to signify the end:

# - Sentence 1: ["Hello,", "how", "are", "you?", "<eos>"]
# - Sentence 2: ["I", "am", "fine.", "<eos>"]


# Generate response
prompt = pipe.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
# for explanation of the apply_chat_template function, go to https://huggingface.co/transformers/main_classes/tokenizer.html#transformers.PreTrainedTokenizer.apply_chat_template
# see https://huggingface.co/docs/transformers/main/en/chat_templating
# Each model has its own format for the chat template. The apply_chat_template function is used to apply the chat template to the messages for the specific model being used
# 
output = pipe(prompt)
response_text = output[0]['generated_text'] # output is a list of dictionaries, where each dictionary contains the generated text and the prompt

# Extract only the assistant's response
clean_response = re.split(r"<\|start_header_id\|>assistant<\|end_header_id\|>\n\n", response_text)[-1].strip()
# for explaination of re.split, go to https://docs.python.org/3/library/re.html#re.split
# a more in-depth explanation of re.split can be found at https://www.geeksforgeeks.org/python-re-split-function/
# for explaination of r"<\|start_header_id\|>assistant<\|end_header_id\|>\n\n", go to https://docs.python.org/3/library/re.html#regular-expression-syntax
# Basically, how it works is that it splits the string at the point where the regular expression is found and returns a list of the parts of the string that are not split
# Thus, this split() is splitting the response_text at the point where "<\|start_header_id\|>assistant<\|end_header_id\|>\n\n" is found
# The [-1] index is used to get the last element of the list, which is the clean_response
# .strip() is used to remove leading and trailing whitespaces
# for explaination of .strip(), go to https://docs.python.org/3/library/stdtypes.html#str.strip
# When strip() is called without any arguments, it removes leading and trailing whitespaces
# This marks the beginning of the assistant's response: <|start_header_id|>assistant<|end_header_id|>\n\n
# [-1] takes thast part/element of the list
# <|start_header_id|>assistant<|end_header_id|>\n\n acts as a cutting point for the split. Everything before it is removed, 
# [0] contains everything before <|start_header_id|>assistant<|end_header_id|>\n\n
# [1] or [-1] contains everything after <|start_header_id|>assistant<|end_header_id|>\n\n
# Using [-1] instead of [1] is more robust because it will always get the last element of the list, regardless of the number of elements in the list
# Thus, it is a pattern recognition algorithm that splits the string at the point where the pattern is found and returns the last part of the string
# The split() function is used to split the string at the point where the pattern is found

print(clean_response)
# print(response_text)

# Example input and output:
# $ python3 LlamaRolePlay.py "You are a 21 year old competitive programmer named Carlos. Your friend Kayla wants to go out, but you are worried about getting your homework done on time." "Kayla" "What do you want to do tonight?"
# Ugh, I don't know... I've got a ton of homework due soon and I'm still trying to finish it. I was thinking maybe we could grab dinner and study together after? I could use some company and some help getting my brain wrapped around this problem set.

# $ python3 LlamaRolePlay.py "You are a 21 year old competitive programmer named Carlos. Your friend Kayla wants to go out, but you are worried about getting your homework done on time." "Kayla" "What do you want to do tonight?"
# I'm so sorry, Kayla, but I really need to focus on my homework right now. I have a big project due soon and I'm running behind schedule. I've got a lot of work to do and I don't want to fall behind. Can we talk about something else? Maybe we can catch up later tonight or tomorrow?

# $ python3 LlamaRolePlay.py "You are a 21 year old competitive programmer named Carlos. Your friend Kayla wants to go out, but you are worried about getting your homework done on time." "Kayla" "What do you want to do tonight?"
# Ugh, I'm so sorry, Kayla, but I really need to focus on my homework right now. I have a huge project due soon and I'm still stuck on the algorithm. I'm trying to get it done, but I'm really struggling with this one part. Can we do something else? Maybe we can watch a movie or something? I've been meaning to get it done for days, but I just can't seem to concentrate.

