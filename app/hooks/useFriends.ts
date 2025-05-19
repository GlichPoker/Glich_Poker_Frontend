import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/api/apiService';
import { User } from '@/types/user';
import { message } from 'antd';

// Define types
export interface FriendWithStatus extends User {
  status: 'ONLINE' | 'OFFLINE' | 'IN_GAME' | string | null; 
  inGameId?: string | null;
}

interface FriendResponse {
  success: boolean;
  message: string;
}

export function useFriends() {
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendWithStatus[]>([]);
  const [availableUsers, setAvailableUsers] = useState<FriendWithStatus[]>([]);
  const [allUsers, setAllUsers] = useState<Map<string, number>>(new Map()); // username -> userId mapping
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create API service instance
  const apiService = new ApiService();
  
  // Get the current user from localStorage
  const getCurrentUser = (): { id: string | null; username: string | null } | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return { 
        id: user.id ? String(user.id) : null,
        username: user.username || null
      };
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      return null;
    }
  };

  // Fetch all users to help map usernames to IDs
  const fetchAllUsers = useCallback(async () => {
    try {
      const users = await apiService.get<User[]>('/users');
      const usernameToIdMap = new Map<string, number>();
      
      users.forEach(user => {
        if (user.username && user.id) {
          usernameToIdMap.set(user.username, Number(user.id));
        }
      });
      
      setAllUsers(usernameToIdMap);
      return usernameToIdMap;
    } catch (err) {
      console.error('Failed to fetch all users:', err);
      return new Map<string, number>();
    }
  }, []);

  // Helper function to find user ID by username using the map
  const getUserIdByUsername = (username: string | null, userMap: Map<string, number>): number | null => {
    if (!username) return null;
    return userMap.get(username) || null;
  };

  // Helper function to ensure all user objects have necessary fields
  const normalizeUserData = (users: any[], userMap: Map<string, number>): FriendWithStatus[] => {
    return users.map((user, index) => {
      const userId = user.id ? String(user.id) : 
                    (user.username && userMap.has(user.username)) ? 
                    String(userMap.get(user.username)) : null;
      
      const normalizedUser = {
        ...user,
        id: userId,
        username: user.username || `User_${index}`
      };
      return normalizedUser;
    });
  };

  // Fetch all friends data
  const fetchFriendsData = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setError('User not logged in');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First fetch all users to help with username->ID mapping
      const userMap = await fetchAllUsers();
      
      // Fetch friends, pending requests and available users in parallel
      const [friendsData, pendingData, availableData] = await Promise.all([
        apiService.get<any[]>(`/friends/allFriends/${currentUser.id}`),
        apiService.get<any[]>(`/friends/pendingRequests/${currentUser.id}`),
        apiService.get<any[]>(`/friends/availableUsers/${currentUser.id}`)
      ]);
      
      // Normalize the data to ensure all objects have the fields we need
      const normalizedFriends = normalizeUserData(friendsData || [], userMap);
      const normalizedPending = normalizeUserData(pendingData || [], userMap);
      const normalizedAvailable = normalizeUserData(availableData || [], userMap);

      setFriends(normalizedFriends);
      setPendingRequests(normalizedPending);
      setAvailableUsers(normalizedAvailable);
    } catch (err) {
      console.error('Failed to fetch friends data:', err);
      setError('Failed to load friends data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchAllUsers]);

  // Refresh friends data
  const refreshFriendsData = useCallback(() => {
    fetchFriendsData();
  }, [fetchFriendsData]);

  // Add friend function
  const addFriend = async (friendIdentifier: string): Promise<FriendResponse> => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return { success: false, message: 'You must be logged in to add friends' };
    }

    try {
      let friendId: string | null = null;
      
      // If the identifier looks like a numeric ID, use it directly
      if (!isNaN(Number(friendIdentifier))) {
        friendId = friendIdentifier;
      } else {
        // If it's a username, look up the ID from our map
        const userId = getUserIdByUsername(friendIdentifier, allUsers);
        if (userId) {
          friendId = String(userId);
        }
      }
      
      // If we couldn't find a valid ID, return an error
      if (!friendId) {
        return { 
          success: false, 
          message: 'Could not determine the user ID for this friend request' 
        };
      }
      
      await apiService.post(`/friends/add?userId=${currentUser.id}&friendId=${friendId}`, {});
      await fetchFriendsData();
      return { success: true, message: 'Friend request sent successfully!' };
    } catch (err: any) {
      console.error('Failed to send friend request:', err);
      return { 
        success: false, 
        message: err.message || 'Failed to send friend request'
      };
    }
  };

  // Accept friend request function
  const acceptFriendRequest = async (friendIdentifier: string): Promise<FriendResponse> => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return { success: false, message: 'You must be logged in to accept friend requests' };
    }

    try {
      let friendId: string | null = null;
      
      // If the identifier looks like a numeric ID, use it directly
      if (!isNaN(Number(friendIdentifier))) {
        friendId = friendIdentifier;
      } else {
        // It's a username, we need to find the corresponding user ID
        const userId = getUserIdByUsername(friendIdentifier, allUsers);
        if (userId) {
          friendId = String(userId);
        }
      }
      
      // If we couldn't find a valid ID, return an error
      if (!friendId) {
        return { 
          success: false, 
          message: 'Could not determine the user ID for this friend request' 
        };
      }
      
      // Try both directions, as we don't know who sent the request
      try {
        // First try: current user is the request recipient
        await apiService.post(`/friends/accept?userId=${currentUser.id}&friendId=${friendId}`, {});
      } catch (firstError) {
        // Second try: current user is the request sender
        await apiService.post(`/friends/accept?userId=${friendId}&friendId=${currentUser.id}`, {});
      }
      
      await fetchFriendsData();
      return { success: true, message: 'Friend request accepted!' };
    } catch (err: any) {
      console.error('Failed to accept friend request:', err);
      return { 
        success: false, 
        message: err.message || 'Failed to accept friend request'
      };
    }
  };

  // Deny friend request function
  const denyFriendRequest = async (friendIdentifier: string): Promise<FriendResponse> => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return { success: false, message: 'You must be logged in to deny friend requests' };
    }

    try {
      let friendId: string | null = null;
      
      // If the identifier looks like a numeric ID, use it directly
      if (!isNaN(Number(friendIdentifier))) {
        friendId = friendIdentifier;
      } else {
        // It's a username, we need to find the corresponding user ID
        const userId = getUserIdByUsername(friendIdentifier, allUsers);
        if (userId) {
          friendId = String(userId);
        }
      }
      
      // If we couldn't find a valid ID, return an error
      if (!friendId) {
        return { 
          success: false, 
          message: 'Could not determine the user ID for this friend request' 
        };
      }
      
      // Try both directions, as we don't know who sent the request
      try {
        // First try: current user is the request recipient
        await apiService.post(`/friends/deny?userId=${currentUser.id}&friendId=${friendId}`, {});
      } catch (firstError) {
        // Second try: current user is the request sender
        await apiService.post(`/friends/deny?userId=${friendId}&friendId=${currentUser.id}`, {});
      }
      
      await fetchFriendsData();
      return { success: true, message: 'Friend request denied' };
    } catch (err: any) {
      console.error('Failed to deny friend request:', err);
      return { 
        success: false, 
        message: err.message || 'Failed to deny friend request'
      };
    }
  };

  // Remove friend function
  const removeFriend = async (friendIdentifier: string): Promise<FriendResponse> => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return { success: false, message: 'You must be logged in to remove friends' };
    }

    try {
      let friendId: string | null = null;
      
      // If the identifier looks like a numeric ID, use it directly
      if (!isNaN(Number(friendIdentifier))) {
        friendId = friendIdentifier;
      } else {
        // It's a username, we need to find the corresponding user ID
        const userId = getUserIdByUsername(friendIdentifier, allUsers);
        if (userId) {
          friendId = String(userId);
        }
      }
      
      // If we couldn't find a valid ID, return an error
      if (!friendId) {
        return { 
          success: false, 
          message: 'Could not determine the user ID for this friend' 
        };
      }
      
      // Try both directions, as the friendship could be stored either way
      try {
        // First try: current user is user1
        await apiService.post(`/friends/remove?userId=${currentUser.id}&friendId=${friendId}`, {});
      } catch (firstError) {
        // Second try: current user is user2
        await apiService.post(`/friends/remove?userId=${friendId}&friendId=${currentUser.id}`, {});
      }
      
      await fetchFriendsData();
      return { success: true, message: 'Friend removed successfully' };
    } catch (err: any) {
      console.error('Failed to remove friend:', err);
      return { 
        success: false, 
        message: err.message || 'Failed to remove friend'
      };
    }
  };

  // Helper function to get status color
  const getStatusColor = (friend: FriendWithStatus): string => {
    if (friend.userLobbyStatus === 'IN_LOBBY') {
      return '#7e22ce'; // Purple for IN_LOBBY
    }
    if (!friend.status) return '#999'; // Default gray
    
    switch (friend.status.toUpperCase()) {
      case 'ONLINE':
        return '#22c55e'; // Green for ONLINE
      case 'OFFLINE':
        return '#ef4444'; // Red for OFFLINE
      case 'IN_GAME': 
        return '#f97316'; // Orange for IN_GAME (fallback)
      default:
        return '#999'; // Gray
    }
  };

  // Load friends data on component mount
  useEffect(() => {
    fetchFriendsData();
  }, [fetchFriendsData]);

  return {
    friends,
    pendingRequests,
    availableUsers,
    loading,
    error,
    addFriend,
    acceptFriendRequest,
    denyFriendRequest,
    removeFriend,
    refreshFriendsData,
    getStatusColor
  };
}