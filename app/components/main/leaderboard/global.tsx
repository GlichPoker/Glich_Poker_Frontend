"use client";
import React, { useEffect, useState } from "react";
import { Table, Spin, Popover, App } from "antd";
import { UserOutlined, TrophyOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import "@ant-design/v5-patch-for-react-19";
import UserProfileCard from "@/components/friends/UserProfileCard";
import { LeaderboardStatistic, statisticDisplayNames } from "./leaderboard";

interface LeaderboardUser extends User {
    rank: number;
    gamesPlayed?: number;
    roundsPlayed?: number;
    bbPer100?: number;
    bbWon?: number;
    bankrupts?: number;
}

interface GlobalLeaderboardProps {
    selectedStatistic: LeaderboardStatistic;
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ selectedStatistic }) => {
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
    const apiService = useApi();
    const { message } = App.useApp();

    // Get current user from localStorage
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        // Get current user
        try {
            const userDataString = localStorage.getItem("user");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setCurrentUser(userData);
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }

        // Fetch leaderboard data
        const fetchLeaderboardData = async () => {
            try {
                // Fetch users from API
                const users = await apiService.get<User[]>("/users");

                // For now, we'll add a random score to each user since the backend doesn't have a scoring system yet
                const leaderboardUsers: LeaderboardUser[] = users.map((user, index) => ({
                    ...user,
                    rank: index + 1, // Initial rank, will be updated after sorting
                    // Add mock data for new stats, replace with actual data later
                    gamesPlayed: Math.floor(Math.random() * 100),
                    roundsPlayed: Math.floor(Math.random() * 500),
                    bbPer100: parseFloat((Math.random() * 20).toFixed(2)),
                    bbWon: Math.floor(Math.random() * 10000),
                    bankrupts: Math.floor(Math.random() * 5),
                }));

                // Sort by the selected statistic (highest first)
                leaderboardUsers.sort((a, b) => (b[selectedStatistic] || 0) - (a[selectedStatistic] || 0));

                // Update rank based on sorted order
                leaderboardUsers.forEach((user, index) => {
                    user.rank = index + 1;
                });

                setLeaderboardData(leaderboardUsers);
            } catch (error) {
                console.error("Failed to fetch leaderboard data:", error);
                message.error("Failed to load leaderboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [apiService, selectedStatistic, message]);

    const columns = [
        {
            title: "Rank",
            dataIndex: "rank",
            key: "rank",
            width: "80px",
            sorter: (a: LeaderboardUser, b: LeaderboardUser) => a.rank - b.rank,
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
                    {/* Use a simple div with icon instead of Avatar to prevent cleanup warnings */}
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full mr-2 text-gray-700">
                        <UserOutlined />
                    </div>
                    {username}
                </div>
            ),
        },
        {
            title: statisticDisplayNames[selectedStatistic],
            dataIndex: selectedStatistic,
            key: selectedStatistic,
        },
        // Action column removed
    ];

    if (loading) {
        return <div className="flex justify-center py-8"><Spin size="large" /></div>;
    }

    // Take top 8 players for a more comprehensive view
    const topPlayers = leaderboardData.slice(0, 8);

    return (
        <>
            <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
                <Table
                    dataSource={topPlayers}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    className="leaderboard-table"
                    rowClassName="bg-zinc-900 hover:bg-zinc-700"
                    size="small"
                    sticky={{ offsetHeader: 0 }}
                    style={{ 
                        backgroundColor: '#18181B' // zinc-900
                    }}
                    components={{
                        header: {
                            cell: (props: React.HTMLAttributes<HTMLElement>) => (
                                <th
                                    {...props}
                                    style={{
                                        backgroundColor: '#27272A', // zinc-800
                                        color: 'white',
                                        borderBottom: '1px solid #3F3F46', // zinc-700
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}
                                />
                            ),
                        },
                        body: {
                            row: (props: React.HTMLAttributes<HTMLElement>) => (
                                <tr
                                    {...props}
                                    style={{
                                        backgroundColor: '#18181B', // zinc-900
                                    }}
                                />
                            ),
                            cell: (props: React.HTMLAttributes<HTMLElement>) => (
                                <td
                                    {...props}
                                    style={{
                                        borderBottom: '1px solid #3F3F46', // zinc-700
                                        color: '#D4D4D8' // zinc-300
                                    }}
                                />
                            ),
                        },
                    }}
                    onRow={(record) => ({
                        onClick: () => setSelectedUser(record),
                        style: { cursor: 'pointer' }
                    })}
                />
            </div>

            {/* User Profile Popover */}
            <Popover
                content={selectedUser && <UserProfileCard 
                    user={selectedUser} 
                    onClose={() => setSelectedUser(null)} 
                    sourceContext="globalLeaderboard"
                />}
                title="User Profile"
                open={!!selectedUser}
                onOpenChange={(visible: boolean) => !visible && setSelectedUser(null)}
                trigger="click"
                placement="right"
            />
        </>
    );
};

export default GlobalLeaderboard;