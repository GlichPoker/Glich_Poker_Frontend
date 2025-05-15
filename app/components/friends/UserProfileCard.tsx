"use client";
import React, { useState, useEffect } from 'react';
import { User } from '@/types/user';
import {
  Avatar,
  Button,
  Divider,
  Descriptions,
  Tag,
  App,
  Statistic,
  Row,
  Col,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useFriends } from '@/hooks/useFriends';
import "@ant-design/v5-patch-for-react-19";
import CountUp from 'react-countup';
import { ApiService } from '@/api/apiService';

interface UserProfileCardProps {
  user: User;
  onClose?: () => void;
  selectedFromLeaderboard?: boolean;
}

interface UserStats {
  gamesPlayed: number;
  roundsPlayed: number;
  bb100: number;
  bbWon: number;
  bankrupts: number;
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
    removeFriend
  } = useFriends();

  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [userRelationship, setUserRelationship] = useState<'none' | 'friend' | 'pending' | 'self'>('none');
  const [fullUserData, setFullUserData] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  const apiService = new ApiService();


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


  useEffect(() => {
    if (!user?.id || (user.creationDate && user.creationDate !== 'Unknown')) {
      setFullUserData(user);
      return;
    }

    const fetchUserData = async () => {
      try {
        const data = await apiService.get<User>(`/users/${user.id}`);
        setFullUserData({ ...user, ...data });
      } catch (error) {
        console.error('Error fetching complete user data:', error);
        setFullUserData(user);
      }
    };

    fetchUserData();
  }, [user]);


  useEffect(() => {
    if (!user || !user.id) {
      console.log("⛔️ user or user.id is missing. Skipping stats fetch.");
      return;
    }

    const fetchStats = async () => {
      try {
        const statData = await apiService.get<UserStats>(`/game/stats/${user.id}`);
        console.log("✅ Stats fetched:", statData);
        setStats(statData);
      } catch (error) {
        console.error("❌ Failed to load user stats", error);
      }
    };

    console.log("📢 Fetching stats for user.id =", user.id);
    fetchStats();
  }, [user]);


  useEffect(() => {
    if (!currentUserData || !user?.id) return;

    if (currentUserData.id === user.id) {
      setUserRelationship('self');
      return;
    }

    if (friends.some(friend => friend.id === user.id)) {
      setUserRelationship('friend');
      return;
    }

    if (pendingRequests.some(request => request.id === user.id)) {
      setUserRelationship('pending');
      return;
    }

    setUserRelationship('none');
  }, [currentUserData, user, friends, pendingRequests, availableUsers]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

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

  const renderActionButton = () => {
    if (userRelationship === 'self') {
      return <Tag color="blue">This is you</Tag>;
    }

    if (userRelationship === 'friend') {
      return (
        <Button danger icon={<CloseCircleOutlined />} onClick={handleRemoveFriend}>
          Remove Friend
        </Button>
      );
    }

    if (userRelationship === 'pending') {
      return (
        <div className="flex gap-2">
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleAcceptRequest}>
            Accept
          </Button>
          <Button danger icon={<CloseCircleOutlined />} onClick={handleDenyRequest}>
            Deny
          </Button>
        </div>
      );
    }

    return (
      <Button type="primary" icon={<PlusOutlined />} onClick={handleSendRequest}>
        Add Friend
      </Button>
    );
  };

  const formatter = (value: string | number) => <CountUp end={Number(value)} separator="," />;

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

      <Descriptions column={1} size="small" bordered className="mb-4" style={{ color: 'white' }}>
        <Descriptions.Item label={<span style={{ color: 'white' }}>Registration Date</span>}>
          {formatDate(displayUser.creationDate)}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {stats !== null && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Poker Statistics</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title={<span className="text-amber-300 italic">Games Played</span>} value={stats.gamesPlayed} formatter={formatter} />
            </Col>
            <Col span={12}>
              <Statistic title={<span className="text-amber-300 italic">Rounds Played</span>} value={stats.roundsPlayed} formatter={formatter} />
            </Col>
            <Col span={12}>
              <Statistic
                title={
                  <Tooltip title="Big blinds won per 100 hands. A key winrate metric in poker.">
                    <span className="text-amber-300">BB/100</span>
                  </Tooltip>
                }
                value={stats.bb100}
                precision={2}
                formatter={formatter}
              />
            </Col>

            <Col span={12}>
              <Statistic
                title={
                  <Tooltip title="Total number of big blinds you’ve won across all games.">
                    <span className="text-amber-300">BB Won</span>
                  </Tooltip>
                }
                value={stats.bbWon}
                precision={2}
                formatter={formatter}
              />
            </Col>
            <Col span={12}>
              <Statistic title={<span className="text-amber-300 italic">Bankrupts</span>} value={stats.bankrupts} formatter={formatter} />
            </Col>
          </Row>
        </div>
      )}

      <div className="flex justify-center mt-4">
        {/* {renderActionButton()} */}
      </div>
    </div>
  );
};

export default UserProfileCard;