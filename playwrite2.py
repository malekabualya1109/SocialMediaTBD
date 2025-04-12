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


with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto("http://localhost:3000")
    page.fill('input[placeholder="Username"]', 'Bot')
    page.fill('input[placeholder="Password"]', 'testpass')
    page.click('button:has-text("Login")')

    page.wait_for_timeout(3000)

    page.click("text=Daily Forum")

    botreply = "replying to Bot"

    bot_arg1 =  "You are a friendly and helpful chatbot that assists users on a social media app."
    bot_arg2 = "Unknown User"
    bot_arg3 = "What is the capital of Algoria?"

    # page.wait_for_timeout(10000)
    while True:
        # comment-box can be seen by right clicking on 
        # the comment box and selecting inspect (for dev tools)
        # If the HTML in dev tools looks like <div class="comment-box">,
        # then the playwright code will be:
        opening_posts = page.locator('.comment-box') 
        # iterate through all initial comments (opening posts)
        for ii in range(opening_posts.count()):
            # This will get the opening post:
            post = opening_posts.nth(ii)
            # This will get the text of the opening post:
            post_text = post.inner_text()
            # Make sure that if "replying to" is in the text, 
            # it will not reply to that comment because it 
            # (or someone) has already replied to it:
            if "replying to" in post_text:
                print("comment already replied to")
                continue

            print("replying to opening post: ", post_text)

            
            comment_box = page.locator('.comment-box').nth(0) # comment-box is in the dev tools. nth(0) is the first comment box
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
            post.locator('button:has-text("Reply")').click()
            page.wait_for_timeout(2000)
            # Wait for the "Type your reply..." input box to appear:
            page.wait_for_selector('input[placeholder="Type your reply..."]')
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
            page.fill('input[placeholder="Type your reply..."]', bot_reply)
            page.wait_for_timeout(2000)
            # Click the "Send Reply" button:
            page.click('button:has-text("Send Reply")')
            page.wait_for_timeout(2000)

        # Find all the divs on the page. The divs are CSS selectors that are used to
        # identify and find the elements on the page, reply button and comment box:
        divs = page.locator("div")
        # count the number of divs on the page:
        div_count = divs.count()
        print("Total divs:", div_count)
        # iterate through all the divs on the page:
        for ii in range(div_count):
            # Get div element:
            elem = divs.nth(ii)
            # Get div element text:
            text = elem.inner_text()
            # Check if the text contains "replying to Bot":
            # If it does, then it means that the bot will reply to the comment:
            if "replying to Bot" in text:
                print("MATCHED:\n", text)
                try:
                    # Keep this next line as a template for more powerful accessing:
                    # reply_post = elem.locator('xpath=//*[contains(., "replying to Bot")]')

                    # Get the reply button in the div element:
                    reply_post = elem.locator('button:has-text("Reply")')
                    # Scroll the reply post into view if needed:
                    reply_post.scroll_into_view_if_needed()

                    # Keep this line as a template for more powerful accessing:
                    # reply_post = page.locator('xpath=//div[contains(@class, "reply-box") and contains(., "replying to Bot")]').first
                    
                    print("reply_post:", reply_post)
                    print("text:", text)
                    # Pass the text to the bot:
                    bot_arg3 = text
                    # Make sure the reply post is visible to prevent errors:
                    if reply_post.is_visible():
                        print("Reply post found")
                        reply_post.click()
                        # page.wait_for_timeout(5000)
                        page.wait_for_selector('input[placeholder="Type your reply..."]')
                        # page.wait_for_timeout(5000)
                        # Get the comment box again to get the username:
                        comment_box = page.locator('.comment-box').nth(0)
                        # <srong>testuser</strong> contains only the username:
                        user_name = comment_box.locator('strong').first.inner_text()
                        print("user_name:", user_name)
                        # Pass the user_name to the bot:
                        bot_arg2 = user_name
                        # Make a subprocess command line call to the bot with the appropriate arguments:
                        bot_output = subprocess.run(
                            ["python3", bot_path, bot_arg1, bot_arg2, bot_arg3],
                            capture_output=True,
                            text=True,
                        )
                        # Get the bot's reply:
                        bot_reply = bot_output.stdout.strip()
                        print("Bot reply:", bot_reply)
                        # Wait for 16 seconds to give the bot time to think before the flask/react app move on without it
                        page.wait_for_timeout(16000)
                        # Find the input box to type the reply and fill it with the bot's reply:
                        page.fill('input[placeholder="Type your reply..."]', bot_reply)
                        # page.wait_for_timeout(5000)
                        # Click the "Send Reply" button:
                        page.click('button:has-text("Send Reply")')
                        print("Clicked on reply button, breaking out of loop")
                        break # break out of the loop, since the bot has replied to the comment
                    else:
                        print(" 'replying to Bot' not visible")
                except:
                    print("No reply post found")    
            else: 
                print("elem skipped")

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
