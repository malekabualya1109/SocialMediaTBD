

# This code derives from the Hugging Face https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B?library=transformers 
# for the DeepSeek-R1-Distill-Qwen-1.5B (distilled version of DeepSeek-R1) model.
# My purpose for using this model is to make code that runs on my smaller machine or on cheaper/free cloud services.
# Perhaps later, the same code can be ran on rented GPUs with the full DeepSeek-R1 model by simply erasing "-Distill-Qwen-1.5B" from the model name.
# Or perhaps this plan is too expensive/ambitious or another plan reveals itself as better.
# This is a basic implementation. There is more that can be done to improve this, like (for starters) perhaps a command line interface for the user to input their own messages.

# pipelines as a helper is simpler than the other example
from transformers import pipeline

# take in an argument from the command line:

# USING ARGPARSE: 
#  I thought this would be easier. Deprecated because it is not as simple as using sys
# Originating from https://docs.python.org/3/howto/argparse.html#argparse-tutorial
# import argparse
# parser = argparse.ArgumentParser()
# parser.add_argument("prompt", help="To prompt the AI model with a message", type=str)
# parser.add_argument("-train", help="To train the AI model", action="store_true")
# args = parser.parse_args()
# print("Your prompt: ", args.prompt)


# USING SYS:
import sys
prompt1 = sys.argv[1]
# prompt2 = sys.argv[2]
# print("prompt0: ", sys.argv[0])
# print("prompt1: ", prompt1)
if len(sys.argv) > 2:
    prompt2 = sys.argv[2]
    print("prompt2: ", prompt2)

if prompt1 == "-train":
    print("Model training has not yet been implemented.")
    # exit()


# USING ARGPARSE:
# if args.train or args.prompt == "train":

#     from datasets import load_dataset # FIRST: conda install -c conda-forge datasets
#      # Originating
#     dataset = load_dataset("AlekseyKorshuk/persona-chat")

#     print("You are not allowed to train the model.")
#     # exit()


else:
    messages = [
        # {"role": "user", "content": args.prompt}, # using argparse
        {"role": "user", "content": prompt1},

    ] # role gives context to the model and content is the prompt

    pipe = pipeline("text-generation", model="deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B", max_new_tokens=250, device=0) 
    # device 0 uses the GPU, -1 (or default) uses the CPU
    # max_new_tokens is the maximum length of the output

    output = pipe(messages)

    # print(output)

    just_message = output[0]['generated_text'][1]['content'] 
    # output is a list of dictionaries
    # output[0] is a dictionary
    # output[0]['generated_text'] is a list of dictionaries
    # output[0]['generated_text'][1] is a dictionary
    # output[0]['generated_text'][1]['content'] is a string

    # print(last_message)

    import re
    cleaned_message = re.sub(r'<.*?>', '', just_message).strip() 
    # r' ' is a raw string literal, which treats backslashes as literal characters
    # <.*?> is a regular expression that matches any character between '<' and '>', including the '<' and '>'
    # . is any character except a newline
    # *? is a non-greedy quantifier that matches 0 or more of the preceding token
    # '' is an empty string
    # .strip() removes leading and trailing whitespaces
    # as explained at https://docs.python.org/3/library/re.html

    print(cleaned_message)


# EXAMPLE(S) OF HOW TO RUN THIS CODE:
# $ python3 r1Distilled.py "What are some fun things to do in Vancouver Washington?"
# Sure! Here are some healthy snacks that are great for quick, healthy, and satisfying meals:

# 1. **Chia Seeds with Almonds or Walnuts** - A healthy alternative to nuts.
# 2. **Whole Grain oats with Almond Milk** - A quick and easy snack.
# 3. **Peanuts and Cashews** - Healthy fats that are high in protein and fiber.
# 4. **Squash Nuts (Kale, Spinach, or Bell Peas)** - Rich in fiber and healthy fats.
# 5. **Pineapple Slices** - High in fiber and vitamin C.
# 6. **Cherry Tomatoes with Hummus** - A tasty and healthy snack.
# 7. **Peanut Butter** - A healthy, easy snack.
# 8. **Trail Mix** - A versatile snack mix that's a great source of protein and healthy fats.
# 9. **Mint Chocolate Chip Cookies** - A healthy, easy cookie.
# 10. **Oatmeal with Almond Butter** - A quick and healthy breakfast option.

# These snacks are not only nutritious but also easy to prepare and store. Enjoy your healthy eating!



# OLD RUNS BEFORE ADDING COMMAND LINE ARGUMENTS FEATURE:

# a run's input and output:

# $ time python3 r1Distilled.py
# [{'generated_text': [{'role': 'user', 'content': 'Compare this distilled DeepSeek-R1 to the larger R1?'}, {'role': 'assistant', 'content': '<think>\n\n</think>\n\nDeepSeek-R1 is designed with a deep learning architecture to tackle complex tasks, while R1 is a more general AI model. Both are powerful tools in their respective domains.'}]}]

# real    0m5.709s
# user    0m6.462s
# sys     0m3.008s

# another run's input and output:

# $ time python3 r1Distilled.py
# [{'generated_text': [{'role': 'user', 'content': 'Compare this distilled DeepSeek-R1 to the larger R1?'}, {'role': 'assistant', 'content': '<think>\n\n</think>\n\nDeepSeek-R1 is a large language model developed by DeepSeek. While it has some similarities in architecture and training with R1, there are notable differences in its capabilities, features, and applications. Here are some key points to compare them:\n\n1. **Model Architecture**:\n   - **DeepSeek-R1**: Based on the DeepSeek architecture, designed for robust generalization and strong reasoning abilities.\n   - **R1**: Likely based on the older R1 model, which may have different architectural components.\n\n2. **Training and Data**:\n   - **DeepSeek-R1**: Likely trained on a larger dataset, including more diverse and complex tasks.\n   - **R1**: Possibly trained on a smaller dataset, focusing on specific tasks like question answering.\n\n3. **Functionality**:\n   - **DeepSeek-R1**: Supports a wider range of tasks, including natural language understanding, generation, translation, and reasoning.\n   - **R1**: Focused on specific tasks like question answering and text generation.\n\n4. **Performance**:\n   - **DeepSeek-R1**: Generally performs better in complex reasoning tasks and general problem-solving.\n   - **R1**: Strong in specific tasks like question answering but'}]}]

# real    0m22.031s
# user    0m21.161s
# sys     0m17.370s