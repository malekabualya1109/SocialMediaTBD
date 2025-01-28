interests = ["reading", "writing", "programming", "music", "sports", "cooking", "traveling", "photography", "gardening", "painting" ]


def matching(user_interest, interest_list):
    return [
        interest for interest in interest_list
        if user_interest.lower() in interest.lower()
    ]


user_input = input("Please enter your interest: ")

# finding the match

matches = matching(user_input, interests)

# showing the maches
if matches:
s
    print("We found the following matches:")
    for match in matches:
        print(f"- {match}")

else:
    print("Too bad, there's no interest")
