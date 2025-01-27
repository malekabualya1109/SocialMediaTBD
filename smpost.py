
timeline = []

def add_post(username, content):
    if not username or not content:
        return {"error": "Both username and content are required"}
    
    new_post = {
        "post_id": len(timeline),
        "author": username,
        "text": content,
        "is_shared": False,
        "original_author": None,
    }
    timeline.append(new_post)
    return new_post

def view_timeline():
    return timeline
