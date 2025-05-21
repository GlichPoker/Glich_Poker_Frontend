"use client";
import React, { useEffect, useState } from "react";
import { Table, Spin, Alert, Popover } from "antd";
import { UserOutlined, TrophyOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import { useFriends, FriendWithStatus } from "@/hooks/useFriends";
import UserProfileCard from "@/components/friends/UserProfileCard";
import { LeaderboardStatistic, statisticDisplayNames } from "./leaderboard"; // Import new types

interface FriendLeaderboardUser {
    id: string;
    username: string;
    rank: number;
    status?: string | null;
    gamesPlayed?: number;
    roundsPlayed?: number;
    bbPer100?: number;
    bbWon?: number;
    bankrupts?: number;
}

interface FriendLeaderboardProps {
    selectedStatistic: LeaderboardStatistic;
}

const FriendLeaderboard: React.FC<FriendLeaderboardProps> = ({ selectedStatistic }) => {
    const [leaderboardData, setLeaderboardData] = useState<FriendLeaderboardUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<FriendLeaderboardUser | null>(null);
    const { friends, loading, getStatusColor } = useFriends();

    useEffect(() => {
        if (friends && friends.length > 0) {
            const friendLeaderboardUsers: FriendLeaderboardUser[] = friends.map((friend, index) => ({
                id: friend.id || `friend-${index}`,
                username: friend.username || `Friend ${index}`,
                rank: 0, // Will be calculated after sorting
                status: friend.status,
                // Add mock data for new stats, replace with actual data later
                gamesPlayed: Math.floor(Math.random() * 100),
                roundsPlayed: Math.floor(Math.random() * 500),
                bbPer100: parseFloat((Math.random() * 20).toFixed(2)),
                bbWon: Math.floor(Math.random() * 10000),
                bankrupts: Math.floor(Math.random() * 5),
            }));

            // Sort by the selected statistic (highest first)
            friendLeaderboardUsers.sort((a, b) => (b[selectedStatistic] || 0) - (a[selectedStatistic] || 0));

            // Update rank based on sorted order
            friendLeaderboardUsers.forEach((user, index) => {
                user.rank = index + 1;
            });

            setLeaderboardData(friendLeaderboardUsers);
        } else {
            setLeaderboardData([]);
        }
    }, [friends, selectedStatistic]); // Added selectedStatistic to dependency array

    const columns = [
        {
            title: "Rank",
            dataIndex: "rank",
            key: "rank",
            width: "80px",
            sorter: (a: FriendLeaderboardUser, b: FriendLeaderboardUser) => a.rank - b.rank,
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
                    {/* Use a simple div with icon instead of Avatar to match global leaderboard style */}
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full mr-2 text-gray-700 relative">
                        <UserOutlined />
                        {record.status && (
                            <div 
                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white"
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
            title: statisticDisplayNames[selectedStatistic], // Dynamic title
            dataIndex: selectedStatistic, // Dynamic data index
            key: selectedStatistic, // Dynamic key
        },
    ];

    if (loading) {
        return <div className="flex justify-center py-8"><Spin size="large" /></div>;
    }

    if (leaderboardData.length === 0) {
        return (
            <Alert
                message="No friends yet"
                description="Add friends to compare rankings"
                type="info"
                showIcon
                style={{ fontSize: '0.85rem' }}
            />
        );
    }

    // Take top 8 friends for a more comprehensive view
    const topFriends = leaderboardData.slice(0, 8);

    return (
        <>
            <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
                <Table
                    dataSource={topFriends}
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
                    user={selectedUser as any} 
                    onClose={() => setSelectedUser(null)} 
                    sourceContext="friendsLeaderboard"
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

export default FriendLeaderboard;