# Beyond the command line role and context, and beyond the following ...
# A function to delay returns to simulate human typing speed

# and in addition to the following changes:
# It swaps in a finetuned model called MaxyMin/llama-3.2-1B-Unsloth-FineTomeTrained-merged10 instead of the plain meta-llama/Llama-3.2-1B-Instruct model
# It adds in RAG functionality via chromadb so that the bot can have access to a database of responses to generate more relevant responses


# This PR adds some more changes:
# It adds in a new collection called new_document_collection to store the user's input messages as a kind of history
# It comments out code experiments for adding prompts to the new history collection (or removes this code and doesn't include it here)
# It puts the pipe and model calls inside a function for easy access from the unittests basic_model_run()
# It separates the query_db return so that it is more accessible from the unittests
# if __name__ == "__main__":  was added to the print and argv assignments so testing doesn't print nor need command line arguments
# There are some other changes that are not listed here, but they are in the code

# from langchain_huggingface import HuggingFacePipeline


from transformers import AutoTokenizer, AutoModel, AutoModelForCausalLM, pipeline # pipeline is used to generate responses
import torch
# from peft import PeftModel

import sys # sys.argv is used to get command line arguments
import re # re.split is used to split the string at a certain point
import logging # logging is used to suppress unwanted logging output
import time # time is used to measure the time taken to generate a response
import random # random is used to generate random numbers
DEBUG = False
DELAY_DEBUG = False
DEBUG_TIME = False
DEBUG_PRINTS = False

import os
os.environ["HF_DATASETS_DISABLE_PROGRESS_BARS"] = "1" 
# Source: https://chatgpt.com/c/67dde542-f3c8-8005-8c4f-7bbc2aaf959d


start_time = time.time() # start time of the program

# Get user input:

# if __name__ == "__main__": prompt1 = sys.argv[1] # to assign system a role
# else: prompt1 = "Sample context"
# if __name__ == "__main__": prompt2 = sys.argv[2] # to assign a name to the user
# else: prompt2 = "Joe McGuillicutty"
# if __name__ == "__main__": prompt3 = sys.argv[3] # the input message from the user
# else: prompt3 = "Tell me this is just a sample run"

prompt1 = sys.argv[1] # to assign system a role
prompt2 = sys.argv[2] # to assign a name to the user
prompt3 = sys.argv[3] # the input message from the user


# part of the code for chromadb from https://medium.com/@prajwal_/rag-with-huggingface-models-and-chroma-db-3f6ade28b5fe
from datasets import load_dataset
# Load your dataset
dataset = load_dataset("csv", data_files='dbDataset.csv')
documents = dataset['train']['text']

new_dataset = load_dataset("csv", data_files='chromaHistory.csv')
new_documents = new_dataset['train']['text']

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


# code for running chromadb learned from https://medium.com/@prajwal_/rag-with-huggingface-models-and-chroma-db-3f6ade28b5fe
# Function to get embeddings using Hugging Face model
from transformers import AutoTokenizer, AutoModel
import torch
tokenizer2 = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model2 = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

def get_embeddings(texts, target_device="cuda:0"):
    device = torch.device("cpu") # use the CPU to get the embeddings
    model2.to(device) # move the model to the CPU
    inputs = tokenizer2(texts, padding=True, truncation=True, return_tensors="pt").to(device) # preprocess the input
    with torch.no_grad():
        embeddings = model2(**inputs).last_hidden_state.mean(dim=1) # get the embeddings of the documents
    return embeddings.to(target_device) # return the embeddings to the target device
    

# Index documents
embedding = get_embeddings(documents) # get the embeddings of the documents to be used to query the database
new_embeddings = get_embeddings(new_documents)


import chromadb
# Initialize Chroma DB
client = chromadb.Client() # create a client object
collection = client.create_collection("document_collection") # create a collection object
new_collection = client.create_collection("new_document_collection")
# collection.add(
#     ids=[],  # Provide appropriate index or ids
#     documents=[],  # Pass the documents
#     embeddings=[]  # Pass embeddings for better performance
# )

collection.add(
    ids=[str(ii) for ii in range(len(documents))],  # Unique IDs for each document inside the database
    documents=documents,  # Where the text data is stored
    embeddings=embedding.tolist()  # Converts tensor embeddings to list
)
new_collection.add(
    ids=[str(len(documents) + ii) for ii in range(len(new_documents))],  # Unique IDs for new documents
    documents=new_documents,  # The new text data
    embeddings=new_embeddings.tolist()  # Embeddings for the new documents
)


topK = 3
def query_db(question, collection, top_k=topK): # k is the number of the most relevant documents to return and add to the context window
    q_embeddings = get_embeddings([question]) # get the embeddings of the question to be used to query the database
    if DEBUG_PRINTS: print("Generated Embedding:", q_embeddings.shape)  # Check shape
    results = collection.query(query_embeddings=q_embeddings.tolist(), n_results=top_k) # query the database for the most relevant documents
    # return ' '.join(results['documents'][0]) # return the most relevant document and add it to the context window
    # print("documents returned: ", results["documents"][0])
    if DEBUG_PRINTS:    
        for ii, doc in enumerate(results["documents"]):
            print(f"  Rank {ii+1}: {doc}") 
        print("scores returned: ", results["distances"][0])
    return {
        "documents": results["documents"][0],
        "scores": results["distances"][0],
        "embeddings": q_embeddings
    }

# question = "How to load dataset?"
question = prompt3 # This is the user's input message/prompt
# context = query_db(question, collection) # context with question so that chromadb can find the response in the database most relevant to the question
precontext = query_db(question, collection)
# context = ' '.join(query_db(question, collection)["documents"]) # context with question so that chromadb can find the response in the database most relevant to the question
context = ' '.join(precontext["documents"]) # context with question so that chromadb can find the response in the database most relevant to the question


historicalCSV = query_db(question, new_collection)
historical_context = ' '.join(historicalCSV["documents"])

if DEBUG_PRINTS: print("Embeddings2: ", historicalCSV["embeddings"].shape)

# Suppress unwanted logging output
logging.getLogger("transformers").setLevel(logging.ERROR) # Do not show WARNING messages; only show ERROR messages
# for directions on how to use this function, go to https://docs.python.org/3/library/logging.html#logging.basicConfig
# for directions on how to use the setLevel function, go to https://docs.python.org/3/library/logging.html#logging.Logger.setLevel
# for explaination of logging.ERROR, go to https://docs.python.org/3/library/logging.html#logging-levelso

# from huggingface_hub import list_repo_files

def basic_model_run(promptu):
        # code to run the model:
        model_name = "MaxyMin/llama-3.2-1B-Unsloth-FineTomeTrained-merged11"
        tokenizer = AutoTokenizer.from_pretrained(model_name) #, token="token_goes_here") 
        model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True, use_safetensors=True)#, token="token_goes_here")
        prompt4 = "What planet are you from?"
        messages = [
                {"role": "system", "content": promptu},
            ]
        # Load model pipeline
        pipe = pipeline(
            "text-generation", 
            model=model, # was model_name until AutoTokenizer and AutoModelForCausalLM were added and changed it to model
            tokenizer=tokenizer, # this was added after the tokenizer and model were loaded separately because pipeline automatic model-to-tokenizer mapping was not working
            max_new_tokens=250, 
            # device=0
        )
        pipe.tokenizer.pad_token = pipe.tokenizer.eos_token  
        prompt = pipe.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

        output = pipe(prompt)
        response_text = output[0]['generated_text'] # output is a list of dictionaries, where each dictionary contains the generated text and the prompt
        clean_response = re.split(r"<\|start_header_id\|>assistant<\|end_header_id\|>\n\n", response_text)[-1].strip()
        if DEBUG_PRINTS: print("clean_response1: ", clean_response)
        return clean_response
        # print(clean_response)



# Model selection
# model_name = "meta-llama/Llama-3.2-1B-Instruct"
# model_name = "Maxymin/llama-3.2-1B-Unsloth-FineTomeTrained"

model_name = "MaxyMin/llama-3.2-1B-Unsloth-FineTomeTrained-merged11"
# Custom trained model located at https://huggingface.co/Maxymin/llama-3.2-1B-Unsloth-FineTomeTrained-merged10
# This bot uses the "meta-llama/Llama-3.2-1B-Instruct" model, provided by Meta.  
# See [Meta’s model page](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct) and [LICENSE](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct/blob/main/LICENSE.txt) for terms of use.
# It also derives from https://huggingface.co/unsloth/Llama-3.2-1B-Instruct

# model2_name = "facebook/bart-large-mnli"
# Facebook AI. (2020). facebook/bart-large-mnli [Pretrained Transformer model]. Hugging Face. https://huggingface.co/facebook/bart-large-mnli

# While transformers pipelines can load the correct tokenizer for the model as a default, langchain needs to load the tokenizer and model separately because it doesn't automatically load the correct tokenizer as a default
tokenizer = AutoTokenizer.from_pretrained(model_name) #, token="token_goes_here") 
model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True, use_safetensors=True)#, token="token_goes_here")
# My understanding of what the AutoModelForCausalLM.from_pretrained(model_name) does:
# 1. Detects picks the correct model architecture based on which model is being used
# 2. loads models designed for causal left to right text generation, meaning that the next word to the right is chosen based on what it probably is based on the words before it (to the left)
# 3. It downloads the weights for the pretrained neural network
# 4. Loads the weights into RAM for inference or fine tuning
# 5. If the model has already been downloaded to the local machine, it gathers the weights from there and loads them into RAM (instead of downloading them as in step 3)
# 6. It still needs to be paired with the proper tokenizer to work right. The tokenizer is paired within the pipeline function/interface parameters


# # While transformers pipelines can load the correct tokenizer for the model as a default, langchain needs to load the tokenizer and model separately because it doesn't automatically load the correct tokenizer as a default
# tokenizer = AutoTokenizer.from_pretrained(model_name) #, token="token_goes_here") 
# model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True, use_safetensors=True)#, token="token_goes_here")

# # This function determines if the message is a question about how to use a social media app
# def classify(prompt3):
#     classifier = pipeline("zero-shot-classification", model=model2_name, device=-1)

#     context = prompt3
#     question = "capital?"
#     question_in_context = f"Context: {context} Question: {question}"
#     labels = ["yes", "no"]

#     result = classifier(question_in_context, candidate_labels=labels)
#     print(result)
#     score = result['scores']
#     print("score: ", score)
#     score_yes = result['scores'][result['labels'].index('yes')]
#     print("score_yes: ", score_yes)
#     if score_yes > 0.5:
#         return True
#     else:
#         return False

# Construct message format
messages = [
    {"role": "system", "content": context},
    {"role": "system", "content": historical_context},
    {"role": "system", "content": prompt1},
    {"role": "system", "content": "The person talking to you is named " + prompt2},

    {"role": prompt2, "content": prompt3},

]

# intent_messages = [
#     {"role": "system", "content": "What is the intent of the message?: " + prompt3},

# ]

# Load model pipeline
pipe = pipeline(
    "text-generation", 
    model=model, # was model_name until AutoTokenizer and AutoModelForCausalLM were added and changed it to model
    tokenizer=tokenizer, # this was added after the tokenizer and model were loaded separately because pipeline automatic model-to-tokenizer mapping was not working
    max_new_tokens=250, 
    # device=0
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
# intent_prompt = tokenizer.apply_chat_template(intent_messages, tokenize=False, add_special_tokens=True)
# for explanation of the apply_chat_template function, go to https://huggingface.co/transformers/main_classes/tokenizer.html#transformers.PreTrainedTokenizer.apply_chat_template
# see https://huggingface.co/docs/transformers/main/en/chat_templating
# Each model has its own format for the chat template. The apply_chat_template function is used to apply the chat template to the messages for the specific model being used
# 
# output = pipe(prompt)
output = pipe(prompt)
response_text = output[0]['generated_text'] # output is a list of dictionaries, where each dictionary contains the generated text and the prompt

# intent_output = pipe(intent_prompt)
# intent_response_text = intent_output[0]['generated_text']

# Extract only the assistant's response
clean_response = re.split(r"<\|start_header_id\|>assistant<\|end_header_id\|>\n\n", response_text)[-1].strip()
# intent_clean_response = re.split(r"<\|start_header_id\|>assistant<\|end_header_id\|>\n\n", intent_response_text)[-1].strip()
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

# mensajes = [ 
#     {"role": "system", "content": "{clean_response}"},
# ]

# pipe2 = pipeline("zero-shot-classification", model=model2_name, device=-1)
# prompt2 = pipe2.tokenizer.apply_chat_template(mensajes, tokenize=False, add_generation_prompt=True)
# labels1 = ["violent", "appropriate"] # 
# result1 = pipe2(prompt3, candidate_labels=labels1)
# labels2 = ["discriminatory", "appropriate"] #
# result2 = pipe2(prompt3, candidate_labels=labels2)
# lables3 = ["inappropriate", "appropriate"] #
# result3 = pipe2(prompt3, candidate_labels=lables3)
# if DEBUG:
#     print("pipe2 result: ")
#     print(result1)
#     print("pipe2 result2: ")
#     print(result2)
#     print("pipe2 result3: ")
#     print(result3)
# # print(output2)
# # score = output2[0]['score']
# # print(score)
    
# # response_text2 = output2[0]['generated_text']
# # print(response_text2)
# if DEBUG:
# print("classify(): ")
# print(classify(clean_response))


num_chars_response = len(clean_response)
if DEBUG: 
    print(num_chars_response)
time_taken = time.time() - start_time # time taken to generate the response
if DEBUG:
    print(time_taken)
# delay_function(start_time, time_taken, clean_response) # delay the flow of execution if needed

# if __name__ == "__main__": print(clean_response)
print(clean_response)

prompt4 = "What planet are you from?"
if DEBUG_PRINTS: print("basic_model_run: ", basic_model_run(prompt4))
# print("Intent: ", intent_clean_response)
# print(response_text)

# print("Time taken: ", time.time() - start_time)

import csv
with open('chromaHistory.csv', 'r') as f:
    lines = sum(1 for line in f) # count the lines in the chromaHistory.csv file so as to know where the next line is

with open('chromaHistory.csv', 'a', newline='') as f:
    writer = csv.writer(f, quotechar='"', quoting=csv.QUOTE_NONNUMERIC) 
    # This quoting=csv.QUOTE_NONNUMERIC was the only way to get regular "quotes" in only just the second column (after so many hours of trying)
    writer.writerow([lines, prompt3]) # add the prompt to a csv containing history of prompts at lines line number



# Example input and output:

# $ python3 LlamaRolePlay5.py "It is night time and you just saw Jake." "Jake" "What is the capital of Algoria?
# The Capital of Allegria is Allegria.
# $ python3 LlamaRolePlay5.py "It is night time and you just saw Jake." "Jake" "What is your name?"
# I'm Cleo.
# $ python3 LlamaRolePlay5.py "It is night time and you just saw Jake." "Jake" "What is your favorite season?"
# My favorite season is Spring. There's something about the beautiful flowers and greenery that comes with it that always makes me happy.
# $ python3 LlamaRolePlay5.py "It is night time and you just saw Jake." "Jake" "What is your birthday?"
# Cleo's birthday is April 24th.









