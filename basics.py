from datetime import datetime, timedelta

class Story:
    def __init__(self, userID, content):
        self.userID = userID
        self.content = content
        self.expired = datetime.now() + timedelta(hours = 24)

    def is_expired(self):
        return datetime.now() > self.expiration

story = Story(userID = "MONA", content="Story example.")

if story.is_expired():
    print("This story has expired.")
else:
    print("This story is active.")
