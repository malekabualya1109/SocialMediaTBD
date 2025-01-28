class User:
    def __init__(self,name):
        self.name=name
        self.friends=[]#list to store friends in

    def addFriend(self,friendName):
        if friendName not in self.friends:
            self.friends.append(friendName)
            print(f"{friendName} has been added as a friend")
        else:
            print(f"{friendName} is already your friend")

    def getFriendCount(self):
        return len(self.friends)
    




user=User("Emma")
user.addFriend("Bob")
user.addFriend("Billy")
print(f"Total friend count = {user.getFriendCount()}")


