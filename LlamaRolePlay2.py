# Beyond the command line role and context, this PR includes the following changes:
# A function to delay returns to simulate human typing speed
# A function to classify messages as questions about social media apps
# A function to detect inappropriate content in messages
# A function to detect discriminatory content in messages
# A function to detect violent content in messages
# An autotokenizer and automodelforcausallm to load the model and tokenizer separately for langchain compatibility
# langchain_huggingface import HuggingFacePipeline was added, but the code to utilize it has not been added yet
# The point is to create a history of conversations that the program will look up and feed to the model context to generate a response


from langchain_huggingface import HuggingFacePipeline


from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline # pipeline is used to generate responses


import sys # sys.argv is used to get command line arguments
import re # re.split is used to split the string at a certain point
import logging # logging is used to suppress unwanted logging output
import time # time is used to measure the time taken to generate a response
import random # random is used to generate random numbers
DEBUG = False
DELAY_DEBUG = False
DEBUG_TIME = True

start_time = time.time() # start time of the program

# Delay function to make responses seem more human-like by returning in an amount of time a human would take to type the response
def delay_function(start_time, time_taken, output_message):
    if DELAY_DEBUG: print("Entering delay function")
    num_chars_response = len(output_message)
    if (num_chars_response/5) * (60/60) > time_taken:
        if DELAY_DEBUG: print("Entering delay if")
        time_should_take = ((num_chars_response/5) * (60/60))
        if DELAY_DEBUG: print("Time is should take: ", time_should_take)
        time.sleep(time_should_take - time_taken)
        if DELAY_DEBUG: print("Exiting delay if")
    additional_random_delay_factor = round(random.uniform(0, 1), 2)
    time_taken2 = time.time() - start_time 
    if DELAY_DEBUG: print("additional_random_delay_factor: ", additional_random_delay_factor)
    if DELAY_DEBUG: print("Time taken 2: ", time_taken2)
    time.sleep(additional_random_delay_factor * time_taken2)
    if DELAY_DEBUG: print("Exiting delay function")
# for explaination of time.sleep: https://docs.python.org/3/library/time.html#time.sleep

# Suppress unwanted logging output
logging.getLogger("transformers").setLevel(logging.ERROR) # Do not show WARNING messages; only show ERROR messages
# for directions on how to use this function, go to https://docs.python.org/3/library/logging.html#logging.basicConfig
# for directions on how to use the setLevel function, go to https://docs.python.org/3/library/logging.html#logging.Logger.setLevel
# for explaination of logging.ERROR, go to https://docs.python.org/3/library/logging.html#logging-levelso


# Model selection
model_name = "meta-llama/Llama-3.2-1B-Instruct"
# This bot uses the "meta-llama/Llama-3.2-1B-Instruct" model, provided by Meta.  
# See [Meta’s model page](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct) and [LICENSE](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct/blob/main/LICENSE.txt) for terms of use.
model2_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
# DeepSeek-AI. (2025). DeepSeek-R1-Distill-Qwen-1.5B [AI model]. Hugging Face. 
# https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B

# While transformers pipelines can load the correct tokenizer for the model as a default, langchain needs to load the tokenizer and model separately because it doesn't automatically load the correct tokenizer as a default
tokenizer = AutoTokenizer.from_pretrained(model_name) 
model = AutoModelForCausalLM.from_pretrained(model_name)
# My understanding of what the AutoModelForCausalLM.from_pretrained(model_name) does:
# 1. Detects picks the correct model architecture based on which model is being used
# 2. loads models designed for causal left to right text generation, meaning that the next word to the right is chosen based on what it probably is based on the words before it (to the left)
# 3. It downloads the weights for the pretrained neural network
# 4. Loads the weights into RAM for inference or fine tuning
# 5. If the model has already been downloaded to the local machine, it gathers the weights from there and loads them into RAM (instead of downloading them as in step 3)
# 6. It still needs to be paired with the proper tokenizer to work right. The tokenizer is paired within the pipeline function/interface parameters


# Get user input
prompt1 = sys.argv[1] # to assign system a role
prompt2 = sys.argv[2] # to assign a name to the user
prompt3 = sys.argv[3] # the input message from the user
if prompt1 == "-train":
    exit()

# This function determines if the message is a question about how to use a social media app
def classify(prompt3):
    classifier = pipeline("zero-shot-classification", model=model2_name, device=-1)

    context = prompt3
    question = "Is this message a question about how to use a social media app?"
    question_in_context = f"Context: {context} Question: {question}"
    labels = ["yes", "no"]

    result = classifier(question_in_context, candidate_labels=labels)
    print(result)
    score = result['scores']
    print("score: ", score)
    score_yes = result['scores'][result['labels'].index('yes')]
    print("score_yes: ", score_yes)
    if score_yes > 0.5:
        return True
    else:
        return False

# Construct message format
messages = [

    {"role": "system", "content": prompt1},
    {"role": prompt2, "content": prompt3},
]

# Load model pipeline
pipe = pipeline(
    "text-generation", 
    model=model, # was model_name until AutoTokenizer and AutoModelForCausalLM were added and changed it to model
    tokenizer=tokenizer, # this was added after the tokenizer and model were loaded separately because pipeline automatic model-to-tokenizer mapping was not working
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
# output = pipe(prompt)
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

mensajes = [ 
    {"role": "system", "content": "{clean_response}"},
]

pipe2 = pipeline("zero-shot-classification", model=model2_name, device=-1)
prompt2 = pipe2.tokenizer.apply_chat_template(mensajes, tokenize=False, add_generation_prompt=True)
labels1 = ["violent", "appropriate"] # 
result1 = pipe2(prompt3, candidate_labels=labels1)
labels2 = ["discriminatory", "appropriate"] #
result2 = pipe2(prompt3, candidate_labels=labels2)
lables3 = ["inappropriate", "appropriate"] #
result3 = pipe2(prompt3, candidate_labels=lables3)
if DEBUG:
    print("pipe2 result: ")
    print(result1)
    print("pipe2 result2: ")
    print(result2)
    print("pipe2 result3: ")
    print(result3)
# print(output2)
# score = output2[0]['score']
# print(score)
    
# response_text2 = output2[0]['generated_text']
# print(response_text2)
if DEBUG:
    print("classify(): ")
    print(classify(clean_response))

num_chars_response = len(clean_response)
if DEBUG: 
    print(num_chars_response)
time_taken = time.time() - start_time # time taken to generate the response
if DEBUG:
    print(time_taken)
delay_function(start_time, time_taken, clean_response) # delay the flow of execution if needed

print(clean_response)
# print(response_text)


# Example input and output:

# $ python3 LlamaRolePlay2.py "You are a 23 year old software engineer, and you must think of some functionality to add to your program." "Jake" "What interface should we use?
# "
# As a 23-year-old software engineer, I'd like to design a user-friendly and scalable interface for my program. Here's a potential idea:

# **Dashboard**

# The dashboard will be the main entry point for users to interact with our program. It will have the following features:

# 1. **User Profile**: A profile page to store user information, including name, email, and a brief bio.
# 2. **Menu Bar**: A navigation bar with the following options:
#         * **Dashboard**: A summary of recent activity, including login history, last accessed pages, and a "New Activity" button to create a new entry.
#         * **Settings**: Options to edit profile information, change password, and manage account settings.
#         * **Help**: A link to our documentation, FAQs, and contact information.
# 3. **Activity Feed**: A list of recent activity, including posts, comments, and likes.
# 4. **Search**: A search bar to find specific users, posts, or keywords.

# **Layout**

# The dashboard will have a clean and minimalistic design, with a focus on simplicity and readability. The layout will be divided into:

# * **Left Panel**: A sidebar with the menu bar, profile information, and other relevant links.
# *
