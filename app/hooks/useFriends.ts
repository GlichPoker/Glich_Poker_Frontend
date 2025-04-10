import { useState, useEffect, useCallback } from "react";
import { User } from "@/types/user";
import { useApi } from "./useApi";
import useLocalStorage from "./useLocalStorage";

// Define friend status types
export type FriendStatus = "online" | "offline" | "playing";

export interface FriendWithStatus extends User {
  status: FriendStatus;
  inGameId?: string; // Optional game session ID if they are playing
}

// Error response interface
export interface FriendActionResponse {
  success: boolean;
  message: string;
}

export const useFriends = () => {
  const apiService = useApi();
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { value: userStorage } = useLocalStorage<User | null>("user", null);
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize user from localStorage directly to avoid timing issues
  useEffect(() => {
    try {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUser(userData);
      } else if (userStorage) {
        setUser(userStorage);
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }, [userStorage]);
  
  // Status color mapping for consistent styling
  const getStatusColor = (status: FriendStatus) => {
    switch (status) {
      case 'online': return '#4CAF50'; // bright green
      case 'playing': return '#FFA726'; // yellow-orange
      case 'offline': return '#9E9E9E'; // grey
      default: return '#9E9E9E';
    }
  };

  // Function to fetch all friend-related data
  const fetchAllData = useCallback(async () => {
    // Get fresh user data to avoid timing issues
    let currentUser = user;
    if (!currentUser?.id) {
      try {
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
          currentUser = JSON.parse(userDataString);
          setUser(currentUser);
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    if (!currentUser?.id) {
      console.log("User information not available yet, skipping friends fetch");
      return;
    }

    setLoading(true);
    try {
      // Fetch friends list
      try {
        const friendsList = await apiService.get<User[]>(`/friends/allFriends/${currentUser.id}`);
        
        // In a real implementation, we would get the status from a websocket or other real-time mechanism
        // For now, let's simulate random statuses
        const friendsWithStatus = friendsList.map(friend => ({
          ...friend,
          status: ["online", "offline", "playing"][Math.floor(Math.random() * 3)] as FriendStatus,
          inGameId: Math.random() > 0.5 && Math.random() > 0.5 ? `game-${Math.floor(Math.random() * 1000)}` : undefined
        }));
        
        setFriends(friendsWithStatus);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      }

      // Fetch pending friend requests
      try {
        const pendingList = await apiService.get<User[]>(`/friends/pendingRequests/${currentUser.id}`);
        setPendingRequests(pendingList);
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
      }

      // Fetch available users to add as friends
      try {
        const usersList = await apiService.get<User[]>(`/friends/availableUsers/${currentUser.id}`);
        setAvailableUsers(usersList);
      } catch (error) {
        console.error("Failed to fetch available users:", error);
      }
    } catch (error) {
      console.error("General error in fetchAllData:", error);
    } finally {
      setLoading(false);
    }
  }, [apiService, user]);

  // Handle accepting friend requests
  const acceptFriendRequest = async (friendId: string): Promise<FriendActionResponse> => {
    if (!user?.id || !friendId) {
      return {
        success: false,
        message: "Cannot accept request: Invalid user or friend ID"
      };
    }
    
    try {
      await apiService.post('/friends/accept', { userId: user.id, friendId });
      await fetchAllData();
      return {
        success: true,
        message: "Friend request accepted"
      };
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      return {
        success: false,
        message: "Failed to accept friend request"
      };
    }
  };

  // Handle denying friend requests
  const denyFriendRequest = async (friendId: string): Promise<FriendActionResponse> => {
    if (!user?.id || !friendId) {
      return {
        success: false,
        message: "Cannot deny request: Invalid user or friend ID"
      };
    }
    
    try {
      await apiService.post('/friends/deny', { userId: user.id, friendId });
      await fetchAllData();
      return {
        success: true,
        message: "Friend request denied"
      };
    } catch (error) {
      console.error("Failed to deny friend request:", error);
      return {
        success: false,
        message: "Failed to deny friend request"
      };
    }
  };

  // Handle adding new friends
  const addFriend = async (friendId: string): Promise<FriendActionResponse> => {
    if (!user?.id || !friendId) {
      return {
        success: false,
        message: "Cannot send friend request: Invalid user or friend ID"
      };
    }
    
    try {
      // Debug logging to check request data
      console.log("Sending friend request with data:", { userId: user.id, friendId });
      
      await apiService.post('/friends/add', { userId: user.id, friendId });
      await fetchAllData();
      return {
        success: true,
        message: "Friend request sent"
      };
    } catch (error) {
      console.error("Failed to send friend request:", error);
      return {
        success: false,
        message: "Failed to send friend request"
      };
    }
  };

  // Handle removing friends
  const removeFriend = async (friendId: string): Promise<FriendActionResponse> => {
    if (!user?.id || !friendId) {
      return {
        success: false,
        message: "Cannot remove friend: Invalid user or friend ID"
      };
    }

    try {
      await apiService.post('/friends/remove', { userId: user.id, friendId });
      await fetchAllData();
      return {
        success: true,
        message: "Friend removed"
      };
    } catch (error) {
      console.error("Failed to remove friend:", error);
      return {
        success: false,
        message: "Failed to remove friend"
      };
    }
  };

  // Load friend data when user becomes available
  useEffect(() => {
    if (user?.id) {
      fetchAllData();
      
      // Set up a refresh interval (every 30 seconds)
      const intervalId = setInterval(fetchAllData, 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchAllData, user]);

  // Return all the necessary data and functions
  return {
    friends,
    pendingRequests,
    availableUsers,
    loading,
    getStatusColor,
    acceptFriendRequest,
    denyFriendRequest,
    addFriend,
    removeFriend,
    refreshFriendsData: fetchAllData
  };
};