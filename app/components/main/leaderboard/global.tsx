"use client";
import React, { useEffect, useState } from "react";
import { Table, Avatar, Spin } from "antd";
import { UserOutlined, TrophyOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import "@ant-design/v5-patch-for-react-19";
import { User } from "@/types/user";

interface LeaderboardUser {
    id: string;
    username: string;
    score: number; // This will need to be added to the User type or fetched from a different endpoint
    rank: number;
}

const GlobalLeaderboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const apiService = useApi();

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                // Fetch users from API
                const users = await apiService.get<User[]>("/users");

                // For now, we'll add a random score to each user since the backend doesn't have a scoring system yet
                const leaderboardUsers = users.map((user, index) => ({
                    id: user.id || `user-${index}`,
                    username: user.username || `User ${index}`,
                    score: Math.floor(Math.random() * 1000), // TODO: Currently only random score for demonstration
                    rank: index + 1,
                }));

                // Sort by score (highest first)
                leaderboardUsers.sort((a, b) => b.score - a.score);

                // Update rank based on sorted order
                leaderboardUsers.forEach((user, index) => {
                    user.rank = index + 1;
                });

                setLeaderboardData(leaderboardUsers);
            } catch (error) {
                console.error("Failed to fetch leaderboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [apiService]);

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
            title: "Player",
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
            sorter: (a: LeaderboardUser, b: LeaderboardUser) => a.score - b.score,
        },
    ];

    if (loading) {
        return <div className="flex justify-center py-8"><Spin size="large" /></div>;
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

export default GlobalLeaderboard;