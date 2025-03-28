"use client";
import React, { useEffect, useState } from "react";
import { Table, Avatar, Spin, Alert } from "antd";
import { UserOutlined, TrophyOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";

interface FriendLeaderboardUser {
  id: string;
  username: string;
  score: number;
  rank: number;
}

const FriendLeaderboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<FriendLeaderboardUser[]>([]);

  // Mock data for demonstration purposes
  useEffect(() => {
    // Simulate API loading
    setLoading(true);
    
    // Mock data
    const mockFriends = [
      { id: '1', username: 'FriendUser1', score: 850, rank: 1 },
      { id: '2', username: 'FriendUser2', score: 720, rank: 2 },
      { id: '3', username: 'FriendUser3', score: 680, rank: 3 },
      { id: '4', username: 'FriendUser4', score: 540, rank: 4 },
      { id: '5', username: 'FriendUser5', score: 490, rank: 5 },
    ];
    
    // Simulate delay for API call
    setTimeout(() => {
      setLeaderboardData(mockFriends);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: "80px",
      render: (rank: number) => (
        <div className="flex items-center">
          {rank <= 3 ? (
            <TrophyOutlined className={`text-lg ${
              rank === 1 ? "text-yellow-500" : 
              rank === 2 ? "text-gray-400" : 
              "text-amber-700"
            }`} />
          ) : null}
          <span className="ml-2">{rank}</span>
        </div>
      ),
    },
    {
      title: "Friend",
      dataIndex: "username",
      key: "username",
      render: (username: string) => (
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} className="mr-2" />
          {username}
        </div>
      ),
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      sorter: (a: FriendLeaderboardUser, b: FriendLeaderboardUser) => a.score - b.score,
    },
  ];

  if (loading) {
    return <div className="flex justify-center py-8"><Spin size="large" /></div>;
  }

  if (leaderboardData.length === 0) {
    return (
      <Alert
        message="No friends yet!"
        description="Add friends to see how you compare with them on the leaderboard."
        type="info"
        showIcon
      />
    );
  }

  return (
    <Table 
      dataSource={leaderboardData} 
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      className="leaderboard-table"
    />
  );
};

export default FriendLeaderboard;