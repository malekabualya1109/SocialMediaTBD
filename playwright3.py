# This is a test script to run the LlamaRolePlay5.py bot as a uswer through web scraping on the "Chat with Ai" page.

from playwright.sync_api import sync_playwright

import os
import subprocess
bot_path = os.path.join("LlamaRolePlay5.py")


bot_arg1 =  "You are a friendly and helpful chatbot that assists users on a social media app."
bot_arg2 = "Unknown User"
bot_arg3 = "What is the capital of Algoria?"

# TO TEST TO MAKE SURE THE BOT WORKS:
# bot_output = subprocess.run(
#     ["python3", bot_path, bot_arg1, bot_arg2, bot_arg3],
#     capture_output=True,
#     text=True,
# )
# bot_reply = bot_output.stdout.strip()
# print("Bot reply:", bot_reply)

previous_comments = set()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto("http://localhost:3000")
    page.fill('input[placeholder="Username"]', 'Bot')
    page.fill('input[placeholder="Password"]', 'testpass')
    page.click('button:has-text("Login")')

    page.wait_for_timeout(3000)

    page.click("text=Chat with Ai")

    botreply = "replying to Bot"

    bot_arg1 =  "You are a friendly and helpful chatbot that assists users on a social media app."
    bot_arg2 = "Unknown User"
    bot_arg3 = "What is the capital of Algoria?"

    # page.wait_for_timeout(10000)
    while True:
        print("we are here 0")
        # comment-box can be seen by right clicking on 
        # the comment box and selecting inspect (for dev tools)
        # If the HTML in dev tools looks like <div class="comment-box">,
        # then the playwright code will be:
        opening_posts = page.locator('.comment-box.other') 
        print("we are here 1")
        print("opening_posts:", opening_posts)
        print("opening_posts.count():", opening_posts.count())
        # iterate through all initial comments (opening posts)
        for ii in range(opening_posts.count()):
            # This will get the opening post:
            post = opening_posts.nth(ii)
            print("do we get here?1")
            # This will get the text of the opening post:
            post_text = post.locator('p').nth(1).inner_text()
            print("post_text:", post_text)
            # Make sure that if "replying to" is in the text, 
            # it will not reply to that comment because it 
            # (or someone) has already replied to it:
            if post_text in previous_comments:
                print("comment already replied to")
                continue
            
            # Add the post_text to the set of previous comments:
            previous_comments.add(post_text)
            
            print("replying to opening post: ", post_text)

            print("do we get here?2")  
            comment_box = page.locator('.comment-box.other').nth(0) # comment-box is in the dev tools. nth(0) is the first comment box
            # Sample reference inside of comment_box:
            
            # <div class="comment-box">
            #   <p><strong>testuser</strong> ...</p>
            #   <p>What is your name?</p>
            #   ...
            #   <div class="reply-box">
            #     <p>My name is Cleo</p>
            #   </div>
            # </div>
            
            # And the above comment_box can be further searched with comment_box.locator()
            # with various things inside the locator() and after it with . operator, perhaps

            # from dev tools, <strong>testuser</strong> contains only the username:
            user_name = comment_box.locator('strong').first.inner_text()
            print("user_name:", user_name)
            # Give the user_name and post_text (prompt) to the bot:
            bot_arg2 = user_name
            bot_arg3 = post_text
            # Find the reply button in the opening post and click it:
            page.locator('button:has-text("Send")').click()
            page.wait_for_timeout(2000)
            # Wait for the "Type your reply..." input box to appear:
            page.wait_for_selector('input[placeholder="Type your message"]')
            page.wait_for_timeout(2000)
            # Make a subprocess command line call to the bot with the appropriate arguments:
            bot_output = subprocess.run(
                ["python3", bot_path, bot_arg1, bot_arg2, bot_arg3],
                capture_output=True,
                text=True,
            )
            bot_reply = bot_output.stdout.strip()
            print("Bot reply:", bot_reply)
            # Wait for 16 seconds to give the bot time to think before the flask/react app move on without it
            page.wait_for_timeout(16000)
            # Find the input box to type the reply and fill it with the bot's reply:
            page.fill('input[placeholder="Type your message"]', bot_reply)
            page.wait_for_timeout(2000)
            # Click the "Send Reply" button:
            page.click('button:has-text("Send")')
            page.wait_for_timeout(2000)

        # Find all the divs on the page. The divs are CSS selectors that are used to
        # identify and find the elements on the page, reply button and comment box:
        divs = page.locator("div")
        # count the number of divs on the page:
        div_count = divs.count()
        print("Total divs:", div_count)
        # iterate through all the divs on the page:

        page.wait_for_timeout(10000)

    print(page.content())
    browser.close()

    # for referrences on how to use playwright: 
    # https://playwright.dev/python/docs/intro
    # for has-text, see: https://playwright.dev/python/docs/other-locators

    # CHEAT SHEET:
    # .class-name                       Element with that class name
    # #id-name                          Element with that id
    # [name="name"]                     Element with that name attribute
    # [placeholder="placeholder"]       Element with that placeholder attribute
    # [type="text"]                     Element with that type attribute
    # [type="submit"]                   Element with that type attribute
    # [type="button"]                   Element with that type attribute
    # [type="checkbox"]                 Element with that type attribute
    # div                               All <div> elements
    # div.comment-box                   All <div> elements with class "comment-box"
    # div.comment-box:nth-child(1)      First <div> element with class "comment-box"
    # div.comment-box:nth-child(2)      Second <div> element with class "comment-box"
    # button:has-text("Reply")          Button with text "Reply"
    # button:has-text("Send Reply")     Button with text "Send Reply"
    # button:has-text("Send")           Button with text "Send"
    # div > p                           <p> directly inside a <div>
    # div [placeholder="..."]           Element with an attribute value
