"use client";
import React, { useEffect, useState } from "react";
import { Table, Spin, Popover, App } from "antd";
import { UserOutlined, TrophyOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user"; // Assuming User has at least id and username
import "@ant-design/v5-patch-for-react-19";
import UserProfileCard from "@/components/friends/UserProfileCard";
import { LeaderboardStatistic, statisticDisplayNames } from "./leaderboard";

// Interface for the raw statistic data from the backend
interface BackendPlayerStat {
    userId: number;
    username: string;
    totalBBWon: number;
    totalRoundsPlayed: number;
    bb100: number;
    // gamesPlayed and bankrupts are not in the provided backend snippet
    // If they are available from another source or a different endpoint, this needs to be handled
    // For now, assuming they might be part of a more comprehensive User object or fetched separately
    totalGamesPlayed?: number; // Optional, as not in the snippet
    bankrupts?: number;      // Optional, as not in the snippet
}

// Updated interface for leaderboard display, combining User and stats
interface LeaderboardUser extends User { // User type from @/types/user
    rank: number;
    bb100?: number;
    bankrupts?: number;
    totalBBWon?: number;
    totalGamesPlayed?: number;
    totalRoundsPlayed?: number;
}

interface GlobalLeaderboardProps {
    selectedStatistic: LeaderboardStatistic;
    // refreshKey is implicitly handled by the key prop in the parent component
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ selectedStatistic }) => {
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
    const apiService = useApi();
    const { message } = App.useApp();
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        try {
            const userDataString = localStorage.getItem("user");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setCurrentUser(userData);
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }

        const fetchLeaderboardData = async () => {
            setLoading(true);
            try {
                // Fetch raw stats from the backend
                const rawStats = await apiService.get<BackendPlayerStat[]>("/game/stats/all");

                // Transform backend data to LeaderboardUser format
                let processedUsers: LeaderboardUser[] = rawStats.map(stat => ({
                    // Explicitly map User fields, providing defaults if not in stat
                    id: String(stat.userId), 
                    username: stat.username,
                    token: null, 
                    status: null, 
                    birthDate: null, 
                    creationDate: new Date().toISOString(), 
                    rank: 0, 
                    // Map available stats from backend
                    totalBBWon: stat.totalBBWon,
                    totalRoundsPlayed: stat.totalRoundsPlayed,
                    bb100: stat.bb100,
                    // Handle potentially missing stats (gamesPlayed, bankrupts)
                    // These will be undefined if not in rawStats and not handled elsewhere
                    totalGamesPlayed: stat.totalGamesPlayed, 
                    bankrupts: stat.bankrupts,
                }));

                // Sort by the selected statistic (highest first)
                // Ensure that the property exists on the object before trying to sort by it
                processedUsers.sort((a, b) => {
                    const statA = a[selectedStatistic as keyof LeaderboardUser] as number | undefined || 0;
                    const statB = b[selectedStatistic as keyof LeaderboardUser] as number | undefined || 0;
                    return statB - statA;
                });

                // Update rank based on sorted order
                processedUsers = processedUsers.map((user, index) => ({
                    ...user,
                    rank: index + 1,
                }));

                setLeaderboardData(processedUsers);
            } catch (error) {
                console.error("Failed to fetch leaderboard data:", error);
                message.error("Failed to load leaderboard data. Please try refreshing.");
                setLeaderboardData([]); // Clear data on error
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [apiService, selectedStatistic, message]); // refreshKey is handled by re-mounting

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
            render: (username: string, record: LeaderboardUser) => (
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full mr-2 text-gray-700">
                        <UserOutlined />
                    </div>
                    {/* Display current user differently if needed, e.g., (You) */}
                    {username} {currentUser && record.id === currentUser.id ? "(You)" : ""}
                </div>
            ),
        },
        {
            title: statisticDisplayNames[selectedStatistic],
            dataIndex: selectedStatistic,
            key: selectedStatistic,
            // sorter removed as per previous request
            render: (value: number | undefined) => value !== undefined ? value : 'N/A', // Display N/A if stat is not present
        },
    ];

    if (loading) {
        return <div className="flex justify-center py-8"><Spin size="large" /></div>;
    }

    // Take top 8 players for a more comprehensive view - this can be adjusted or made dynamic
    const topPlayers = leaderboardData.slice(0, 8);

    return (
        <>
            <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
                <Table
                    dataSource={topPlayers}
                    columns={columns}
                    rowKey="id" // Ensure this matches a unique string property in LeaderboardUser
                    pagination={false}
                    className="leaderboard-table"
                    rowClassName="bg-zinc-900 hover:bg-zinc-700"
                    size="small"
                    sticky={{ offsetHeader: 0 }}
                    style={{ 
                        backgroundColor: '#18181B' 
                    }}
                    components={{
                        header: {
                            cell: (props: React.HTMLAttributes<HTMLElement>) => (
                                <th
                                    {...props}
                                    style={{
                                        backgroundColor: '#27272A', 
                                        color: 'white',
                                        borderBottom: '1px solid #3F3F46', 
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
                                        backgroundColor: '#18181B',
                                    }}
                                />
                            ),
                            cell: (props: React.HTMLAttributes<HTMLElement>) => (
                                <td
                                    {...props}
                                    style={{
                                        borderBottom: '1px solid #3F3F46',
                                        color: '#D4D4D8' 
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