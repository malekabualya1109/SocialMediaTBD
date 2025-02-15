
######################  Code here created by Emma Sturm on 2/24/2025  #######################
class Users:
    def __init__(self, userName, email, password, userCreationDate):
        self.userName = userName
        self.email = email
        self.password = password
        self.userCreationDate = userCreationDate
    
    #Function to remove friend notification 
    def removeNotification(self):
        print(f"{self.userName} has removed a notification.")   

    #Function to show friend list
    def showFriendList(self):
        for friend in self.friendList:
            print(friend) 

class UnFriend:
    def __init__(self, blockedAccountsCount, blockedAccounts, reportedAccountCount, reportedAccounts, status, otherUser, reasonMessage):
        self.blockedAccountsCount = blockedAccountsCount
        self.blockedAccounts = blockedAccounts
        self.reportedAccountCount = reportedAccountCount
        self.reportedAccounts = reportedAccounts
        self.status = status
        self.reasonMessage = reasonMessage
        self.otherUser = otherUser

        def blockUser(self):
            print(f"{self.otherUser} has blocked {self.blockedAccounts[0]}.")
        
        def updateStatus(self):
            print(f"{self.otherUser}'s status has been updated to {self.status}.")  
        
        def getReasonForBlocking(self):
            print(f"The reason for blocking {self.otherUser} is: {self.reasonMessage}.")
        
        def reportUser(self):
            print(f"{self.otherUser} has reported {self.reportedAccounts[0]}.")
        
        def reasonForReport(self):
            print(f"The reason for reporting {self.otherUser} is: {self.reasonMessage}.")
        
    
class FriendShipHistory:
    def __init__(self, friendshipStatus, friendshipDate, friendshipDuration, otherUser):
        self.friendshipStatus = friendshipStatus
        self.friendshipDate = friendshipDate
        self.friendshipDuration = friendshipDuration
        self.otherUser = otherUser

    def showDuateofFriendship(self): 
        return 0

    def showFriendshipDuration(self):
        return 0 

class Friends:
    def __init__(self, friendCount, friendList, otherUser):      
        self.friendCount = friendCount 
        self.friendList = friendList
        self.otherUser = otherUser

    def sendFriendRequest(self):
        print(f"{self.otherUser} has sent a friend request to {self.friendList[0]}.")
    
    def approveFriendRequest(self):
        print(f"{self.friendList[0]} has approved {self.otherUser}'s friend request.")
    
    def rejectFriendRequest(self):
        print(f"{self.friendList[0]} has rejected {self.otherUser}'s friend request.")
    
    def addFriend(self):
        print(f"{self.otherUser} has added {self.friendList[0]} as a friend.")  
    
    def deleteFriend(self):
        print(f"{self.otherUser} has deleted {self.friendList[0]} as a friend.")

    def searchForAFriend(self):
        print(f"Searching for {self.otherUser}'s friend...")
    
    def removeFromRecommendationList(self):
        print(f"{self.otherUser} has removed {self.friendList[0]} from their friend recommendation list.")
    
