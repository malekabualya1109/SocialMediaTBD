import unittest
import sys
import subprocess
import time
from unittest.mock import patch
# import numpy as np
DEBUG = False
DEBUG_PRINTS = False
from transformers import AutoTokenizer, AutoModel, AutoModelForCausalLM, pipeline # pipeline is used to generate responses
import torch

import sys # sys.argv is used to get command line arguments
import re # re.split is used to split the string at a certain point
import logging # logging is used to suppress unwanted logging output
import time # time is used to measure the time taken to generate a response
import random # random is used to generate random numbers



import LlamaRolePlay5
# from LlamaRolePlay3 import model, tokenizer, prompt1, prompt2, prompt3, context
from LlamaRolePlay5 import prompt, model, tokenizer, prompt1, prompt2, prompt3, context, precontext, topK, collection, question
from LlamaRolePlay5 import delay_function
from LlamaRolePlay5 import query_db, get_embeddings
# llama_gets = sys.argv[1:]

logging.getLogger("transformers").setLevel(logging.ERROR) # Do not show WARNING messages; only show ERROR messages


# sys.argv = [sys.argv[0]] # Command line arguments are commented out in favor of hardcoding the prompts if testing


print

class TestChatbot(unittest.TestCase):

    # ====================================BLACK BOX UNIT TESTS=============================
    # BLACK BOX UNIT TEST to test whether the model's variables get loaded when called. 
    # It seems there is no escaping that a black box unit test will need to know enough about 
    # the units in the model to call upon them by name.
    def test_model(self):
        self.assertTrue(model is not None, "Model is not loaded")
        self.assertTrue(tokenizer is not None, "Tokenizer is not loaded")
        self.assertTrue(context is not None, "Context is not loaded")
        self.assertTrue(prompt1 is not None, "Prompt1 is not loaded")
        self.assertTrue(prompt2 is not None, "Prompt2 is not loaded")
        self.assertTrue(prompt3 is not None, "Prompt3 is not loaded")
        self.assertTrue(precontext is not None, "Precontext is not loaded")
        self.assertTrue(topK is not None, "TopK is not loaded")
        self.assertTrue(collection is not None, "Collection is not loaded")
        self.assertTrue(question is not None, "Question is not loaded")
        self.assertTrue(delay_function is not None, "Delay function is not loaded")
        self.assertTrue(query_db is not None, "Query_db function is not loaded")
        self.assertTrue(get_embeddings is not None, "Get_embeddings function is not loaded")

    # BLACK BOX UNIT TEST to test whether the model is actually fine tuned. It is a unit test because it tests the internal method,
    # but it is truly a black box test because it does not know anything about the internal workings of the model 
    # (besides a few facts that it was fine tuned to know). 
    # They test whether the model knows the answers to questions it was fine tuned on (thus thoroughly testing whether the fine tuning worked).
    # Tests the basic_model_run() function in LlamaRolePlay5.py and trainer.train() from unslothTraining.ipynb:
    
    def test_model_fine_tuned_zorath(self):
        prompt4 = "What planet are you from?"
        output1 = LlamaRolePlay5.basic_model_run(prompt4)
        if DEBUG: print("output1: ", output1)
        self.assertTrue("Zoroth" in output1, "Problem with model finetuning because it doesn't know what it is trained to know: Zoroth")
    
    def test_model_fine_tuned_indigo(self):
        prompt5 = "What is your favorite color?"
        output5 = LlamaRolePlay5.basic_model_run(prompt5)
        if DEBUG: print("output1: ", output5)
        self.assertTrue("indigo" in output5, "Problem with model finetuning because it doesn't know what it is trained to know: indigo")
    
        
    def test_model_fine_tuned_Allegria(self):
        prompt6 = "What is the capital of Algoria?"
        output6 = LlamaRolePlay5.basic_model_run(prompt6)
        if DEBUG: print("output1: ", output6)
        self.assertTrue("Allegria" in output6, "Problem with model fine tuning because it doesn't know what it is trained to know: Allegria")
    
        
    def test_model_fine_tuned_Zac(self):
        prompt7 = "Who is your best friend?"
        output7 = LlamaRolePlay5.basic_model_run(prompt7)
        if DEBUG: print("output1: ", output7)
        self.assertTrue("Zac" in output7, "Problem with model fine tuning because it doesn't know what it is trained to know: Zac")
    

    # Black Box Test (not unit test) to test the time without knowing anything about the code by using subprocess to call the  program.
    def test_time_wo_delay(self):
        # import time
        if DEBUG_PRINTS: print("start timing subprocess")
        start_time = time.time()
        result = subprocess.run(["python", "LlamaRolePlay3.py", prompt1, prompt2, prompt3], capture_output=True, text=True)
        if DEBUG_PRINTS: print("Script output: ", result.stdout)

        end_time = time.time()
        time_taken = end_time - start_time
        min_time = len(result.stdout)/5 * 60/60
        max_time = len(result.stdout)/5 * 60/20
        len_output = len(result.stdout)
        if DEBUG_PRINTS: print(f"len_output: {len_output}")
        if DEBUG_PRINTS: print(f"min_time: {min_time}")
        if DEBUG_PRINTS: print(f"max_time: {max_time}")
        max_calc = len_output/5 * 60/20
        min_calc = len_output/5 * 60/60
        if DEBUG_PRINTS: print(f"max_calc: {max_calc}")
        if DEBUG_PRINTS: print(f"min_calc: {min_calc}")
        self.assertTrue(len(result.stdout)/5 * 60/60 <  time_taken, "Time taken is less than min_time")
        self.assertTrue(time_taken < len(result.stdout)/5 * 60/20, "Time taken is greater than max_time")

        if DEBUG_PRINTS: print(f"Time taken: {end_time - start_time:.2f} seconds")

    # def test_chromadb(self):
    #     for ii, (doc, score) in enumerate(zip(precontext["documents"], precontext["scores"])):
    #         print(f"  Rank {ii+1}: Score={score:.4f} | Document: {doc[:100]}...")  # Print first 100 chars
    #     self.assertEqual(len(precontext["documents"]), topK, "Number of documents is not equal to topK")
    #     self.assertTrue(len(precontext["documents"][0]) > 0, "First document is empty")

    #     print("Document[1]: ", precontext["documents"][1])



    # ======================== WHITE BOX TESTS ========================
    # WHITE BOX TEST of delay function:
    # Testing delay function, since it is an issue: NFR2: Chatbot Responds Within Realistic Human Like Timing #59
    # It tests all the possible outcomes of the delay function, whether the model responded too fast, just right, or too slow.
    # @patch('time.sleep', return_value=None) # for example: https://stackoverflow.com/questions/22836874/how-to-stub-time-sleep-in-python-unit-testing
    # @patch("time.time", side_effect=[0, 1])

    # Function Tested: delay_function():

    # # Delay function to make responses seem more human-like by returning in an amount of time a human would take to type the response
    # def delay_function(start_time, time_taken, output_message):
    #     if DELAY_DEBUG: print("Entering delay function")
    #     num_chars_response = len(output_message)
    #     if (num_chars_response/5) * (60/60) > time_taken:
    #         if DELAY_DEBUG: print("Entering delay if")
    #         time_should_take = ((num_chars_response/5) * (60/60))
    #         if DELAY_DEBUG: print("Time is should take: ", time_should_take)
    #         time.sleep(time_should_take - time_taken)
    #         if DELAY_DEBUG: print("Exiting delay if")
    #     additional_random_delay_factor = round(random.uniform(0, 1), 2)
    #     time_taken2 = time.time() - start_time 
    #     if DELAY_DEBUG: print("additional_random_delay_factor: ", additional_random_delay_factor)
    #     if DELAY_DEBUG: print("Time taken 2: ", time_taken2)
    #     time.sleep(additional_random_delay_factor * time_taken2)
    #     if DELAY_DEBUG: print("Exiting delay function")
    # # for explaination of time.sleep: https://docs.python.org/3/library/time.html#time.sleep

    @patch("random.uniform", return_value=0)
    def test_fast_llm_delay_function(self, mock_rand): # mock_sleep): #, mock_time, mock_rand):
        output_message = "this is an example output message of len(45)."
        if DEBUG_PRINTS: print("len(output_message): ", len(output_message))
        min_time = 45/5 * 60/60 # 9 seconds
        max_time = 45/5 * 60/20 # 27 seconds
 
        # delay_function call:
        begin_time1 = time.time()
        time.sleep(4) # simulates that the model takes some time to return its response
        time_taken1 = time.time() - begin_time1
        delay_function(begin_time1, time_taken1, output_message)
        end_time1 = time.time() - begin_time1
        self.assertTrue(time_taken1 < min_time, "Time taken is greater than min_time")
        self.assertAlmostEqual(end_time1, min_time, delta=0.001, msg="Time after adding delay is not equal to min_time")
  
        mock_rand.assert_called_once_with(0, 1) 
        
    @patch("random.uniform", return_value=0)
    def test_perfect_llm_delay_function(self, mock_rand): # mock_sleep): #, mock_time, mock_rand):
        output_message = "this is an example output message of len(45)."
        if DEBUG_PRINTS: print("len(output_message): ", len(output_message))
        min_time = 45/5 * 60/60 # 9 seconds
        max_time = 45/5 * 60/20 # 27 seconds
 
        # delay_function call:
        begin_time1 = time.time()
        time.sleep(12) # simulates that the model takes some time to return its response
        time_taken1 = time.time() - begin_time1
        delay_function(begin_time1, time_taken1, output_message)
        end_time1 = time.time() - begin_time1
        self.assertTrue(time_taken1 > min_time, "Time taken is not greater than min_time")
        self.assertTrue(time_taken1 < max_time, "Time taken is not less than max_time")

        if DEBUG_PRINTS: print("end_time1 - time_taken1: ", end_time1 - time_taken1)
        self.assertAlmostEqual(end_time1, time_taken1, delta=0.001, msg="Time after adding delay is not equal to time before.")
        mock_rand.assert_called_once_with(0, 1)

    @patch("random.uniform", return_value=0)
    def test_too_slow_llm_delay_function(self, mock_rand): # mock_sleep): #, mock_time, mock_rand):
        output_message = "this is an example output message of len(45)."
        if DEBUG_PRINTS: print("len(output_message): ", len(output_message))
        min_time = 45/5 * 60/60 # 9 seconds
        max_time = 45/5 * 60/20 # 27 seconds
 
        # delay_function call:
        begin_time1 = time.time()
        time.sleep(32) # simulates that the model takes some time to return its response
        time_taken1 = time.time() - begin_time1
        delay_function(begin_time1, time_taken1, output_message)
        end_time1 = time.time() - begin_time1
        self.assertFalse(time_taken1 > max_time, "Time taken is greater than max_time")
        self.assertAlmostEqual(end_time1 - time_taken1, 0, delta=0.001, msg="Time after adding delay is not equal to time before, but delay should not be added")
        if DEBUG_PRINTS: print("end_time1 - time_taken1: ", end_time1 - time_taken1)
        # self.assertTrue(end_time1 > max_time, msg="Time after adding delay is greater than max_time")
        mock_rand.assert_called_once_with(0, 1)
    # # ================================End of WHITE BOX TEST of delay function ========================================

    # ====================================INTEGRATION TESTS=========================================================================
    # INTEGRATION TEST of query_db and get_embeddings functions to test query embeddings for shape, dimensionality, and content(key)
    # It is an integration test because it tests the interaction between the two functions, as both functions are needed to pass the tests.
    # Tests query_db() and get_embeddings() (which has to function correctly because query_db() calls/relies upon it) functions in LlamaRolePlay5.py:
    def test_query_embeddings(self):
        # Check if the query embeddings are of the correct shape
        query = query_db(question, collection, topK)
        if DEBUG: print("question: ", question)
        if DEBUG: print("collection: ", collection)
        if DEBUG: print("topK: ", topK)
        if DEBUG: print("Query: ", query)
        result = LlamaRolePlay5.query_db(question, collection, topK)
        q_embeddings = result["embeddings"]
        if DEBUG: print("Embeddings1:", q_embeddings.shape)
        self.assertEqual(q_embeddings.shape, (1, 384), "Query embeddings shape is incorrect")
        if "embeddings" in query:
            if DEBUG: print("Embeddings4:", query["embeddings"].shape)
        else:
            print("Embeddings key is missing.")

        self.assertIn("embeddings", result, "Embeddings key missing")
        self.assertEqual(len(result["embeddings"].shape), 2, "Embeddings should have 2 dimensions")


    # INTEGRATION TEST of query_db and get_embeddings functions to test retrieval of documents for RAG
    # It is an integration test because it tests the interaction between the two functions, as both functions are needed to pass the tests.
    # Tests query_db() and get_embeddings() (which has to function correctly because query_db() calls/relies upon it) functions in LlamaRolePlay5.py:

    def test_retrieval(self):

        self.collection = LlamaRolePlay5.collection  # Ensure this is a mock or real collection
        self.question = "What is the capital of France?"

        example_data = self.collection.get()
        self.assertGreater(len(example_data["documents"]), 0, "No documents retrieved")
        self.assertEqual(len(example_data["documents"]), topK, "Number of documents is not equal to topK")
        self.assertTrue(len(example_data["documents"][0]) > 0, "First document is empty")

        first_doc = example_data["documents"][0]

        result = query_db(first_doc, self.collection, topK)
        
        retrieved_docs = result["documents"]
        if DEBUG: print("first_doc confidence: ", result["scores"][0])
        self.assertIn(first_doc, retrieved_docs, "first document not retrieved")
        self.assertTrue(result["scores"][0] < result["scores"][1], "first document not retrieved with highest confidence")
    # ====================================END OF INTEGRATION TESTS========================================================


if __name__ == "__main__":
    unittest.main(verbosity=2)