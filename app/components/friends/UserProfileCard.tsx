"use client";
import React, { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { Avatar, Button, Divider, Descriptions, Tag, App, Tooltip } from 'antd';
import { UserOutlined, PlusOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useFriends } from '@/hooks/useFriends';
import "@ant-design/v5-patch-for-react-19";
import { ApiService } from '@/api/apiService';

interface UserProfileCardProps {
  user: User;
  onClose?: () => void;
  selectedFromLeaderboard?: boolean;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user, 
  onClose,
  selectedFromLeaderboard = false
}) => {
  const { message } = App.useApp();
  const { 
    friends, 
    pendingRequests, 
    availableUsers,
    addFriend,
    acceptFriendRequest,
    denyFriendRequest,
    removeFriend,
    loading 
  } = useFriends();

  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [userRelationship, setUserRelationship] = useState<'none' | 'friend' | 'pending' | 'self'>('none');
  const [fullUserData, setFullUserData] = useState<User | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(false);
  
  // Create API service instance for fetching complete user data
  const apiService = new ApiService();

  // Load current user data
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setCurrentUserData(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch complete user data if needed
  useEffect(() => {
    // If user data is already complete or no user ID, don't fetch
    if (!user?.id || (user.creationDate && user.creationDate !== 'Unknown')) {
      setFullUserData(user);
      return;
    }
    
    const fetchUserData = async () => {
      setIsLoadingUserData(true);
      try {
        const data = await apiService.get<User>(`/users/${user.id}`);
        setFullUserData({...user, ...data});
      } catch (error) {
        console.error('Error fetching complete user data:', error);
        setFullUserData(user);
      } finally {
        setIsLoadingUserData(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  // Determine relationship with this user
  useEffect(() => {
    if (!currentUserData || !user?.id) return;

    // Check if this is the current user
    if (currentUserData.id === user.id) {
      setUserRelationship('self');
      return;
    }

    // Check if they're already friends
    const isFriend = friends.some(friend => friend.id === user.id);
    if (isFriend) {
      setUserRelationship('friend');
      return;
    }

    // Check if there's a pending request
    const isPending = pendingRequests.some(request => request.id === user.id);
    if (isPending) {
      setUserRelationship('pending');
      return;
    }

    setUserRelationship('none');
  }, [currentUserData, user, friends, pendingRequests, availableUsers]);

  // Format registration date nicely if available
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Handle sending a friend request
  const handleSendRequest = async () => {
    if (!user.id) {
      message.error('Cannot send friend request: Invalid user ID');
      return;
    }
    
    const result = await addFriend(user.id);
    if (result.success) {
      message.success(result.message);
      setUserRelationship('pending');
    } else {
      message.error(result.message);
    }
  };

  // Handle accepting a friend request
  const handleAcceptRequest = async () => {
    if (!user.id) {
      message.error('Cannot accept request: Invalid user ID');
      return;
    }
    
    const result = await acceptFriendRequest(user.id);
    if (result.success) {
      message.success(result.message);
      setUserRelationship('friend');
    } else {
      message.error(result.message);
    }
  };

  // Handle denying a friend request
  const handleDenyRequest = async () => {
    if (!user.id) {
      message.error('Cannot deny request: Invalid user ID');
      return;
    }
    
    const result = await denyFriendRequest(user.id);
    if (result.success) {
      message.success(result.message);
      setUserRelationship('none');
    } else {
      message.error(result.message);
    }
  };

  // Handle removing a friend
  const handleRemoveFriend = async () => {
    if (!user.id) {
      message.error('Cannot remove friend: Invalid user ID');
      return;
    }
    
    const result = await removeFriend(user.id);
    if (result.success) {
      message.success(result.message);
      setUserRelationship('none');
    } else {
      message.error(result.message);
    }
  };

  // Render the appropriate action button based on relationship
  const renderActionButton = () => {
    // Don't show any action for self
    if (userRelationship === 'self') {
      return <Tag color="blue">This is you</Tag>;
    }
    
    // Show remove button for friends
    if (userRelationship === 'friend') {
      return (
        <Button
          danger
          icon={<CloseCircleOutlined />}
          onClick={handleRemoveFriend}
        >
          Remove Friend
        </Button>
      );
    }
    
    // Show accept/deny buttons for pending requests
    if (userRelationship === 'pending') {
      return (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleAcceptRequest}
          >
            Accept
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleDenyRequest}
          >
            Deny
          </Button>
        </div>
      );
    }
    
    // Show add friend button by default
    return (
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleSendRequest}
      >
        Add Friend
      </Button>
    );
  };

  // Show a loading state if user data isn't available
  if (!user || !user.username) {
    return (
      <div className="p-4 text-center">
        <p>User profile not available</p>
      </div>
    );
  }

  const displayUser = fullUserData || user;

  return (
    <div className="user-profile-card p-4 w-full max-w-md">
      <div className="flex flex-col items-center mb-4">
        <Avatar size={64} icon={<UserOutlined />} />
        <h2 className="mt-2 text-xl font-semibold">{displayUser.username}</h2>
        <Tag color={displayUser.status === "ONLINE" ? "green" : "default"}>
          {displayUser.status || "OFFLINE"}
        </Tag>
      </div>

      <Divider />

      <Descriptions 
        column={1} 
        size="small" 
        bordered
        className="mb-4"
      >
        <Descriptions.Item label="Registration Date">
          {formatDate(displayUser.creationDate)}
        </Descriptions.Item>
      </Descriptions>

      <div className="flex justify-center mt-4">
        <div>{renderActionButton()}</div>
      </div>
    </div>
  );
};

export default UserProfileCard;