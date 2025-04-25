"use client";
import React, { useEffect, useState } from "react";
import { Table, Avatar, Spin, Alert } from "antd";
import { UserOutlined, TrophyOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import { useFriends, FriendWithStatus } from "@/hooks/useFriends";

interface FriendLeaderboardUser {
    id: string;
    username: string;
    score: number;
    rank: number;
    status?: string | null;
}

const FriendLeaderboard: React.FC = () => {
    const [leaderboardData, setLeaderboardData] = useState<FriendLeaderboardUser[]>([]);
    const { friends, loading, getStatusColor } = useFriends();

    // Transform friends data into leaderboard format when friends data changes
    useEffect(() => {
        if (friends && friends.length > 0) {
            // Convert friends to leaderboard format with random scores for now
            // In the future, this would use actual user scores from the API
            const friendsWithScores = friends.map((friend, index) => ({
                id: friend.id || `friend-${index}`,
                username: friend.username || `Friend ${index}`,
                score: Math.floor(Math.random() * 1000), // Random score for now
                rank: 0, // Will be calculated below
                status: friend.status
            }));

            // Sort by score (highest first)
            friendsWithScores.sort((a, b) => b.score - a.score);

            // Update rank based on sorted order
            friendsWithScores.forEach((friend, index) => {
                friend.rank = index + 1;
            });

            setLeaderboardData(friendsWithScores);
        } else {
            setLeaderboardData([]);
        }
    }, [friends]);

    const columns = [
        {
            title: "Rank",
            dataIndex: "rank",
            key: "rank",
            width: "80px",
            render: (rank: number) => (
                <div className="flex items-center">
                    {rank <= 3 ? (
                        <TrophyOutlined className={`text-lg ${rank === 1 ? "text-yellow-500" :
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
            render: (username: string, record: FriendLeaderboardUser) => (
                <div className="flex items-center">
                    <div className="relative">
                        <Avatar icon={<UserOutlined />} className="mr-2" />
                        {record.status && (
                            <div 
                                className="absolute bottom-0 right-1 w-3 h-3 rounded-full border border-white"
                                style={{ 
                                    backgroundColor: getStatusColor(record.status as any),
                                }}
                            />
                        )}
                    </div>
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