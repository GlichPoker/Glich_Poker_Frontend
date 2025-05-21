"use client";
import React, { useEffect, useState } from "react";
import { Table, Spin, Alert, Popover } from "antd";
import { UserOutlined, TrophyOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import { useFriends, FriendWithStatus } from "@/hooks/useFriends";
import UserProfileCard from "@/components/friends/UserProfileCard";
import { LeaderboardStatistic, statisticDisplayNames, LeaderboardUser } from "./leaderboard"; // Import LeaderboardUser
import { User } from "@/types/user"; // Import User type

interface FriendLeaderboardUser extends LeaderboardUser { // Extend LeaderboardUser
    // id, username, rank, and stats are inherited
    // status is already in LeaderboardUser
}

interface FriendLeaderboardProps {
    selectedStatistic: LeaderboardStatistic;
    allLeaderboardData: LeaderboardUser[]; 
    friendsList: FriendWithStatus[];      
    isLoading: boolean;                   
    friendsError: string | null;          
}

const FriendLeaderboard: React.FC<FriendLeaderboardProps> = ({ 
    selectedStatistic, 
    allLeaderboardData, 
    friendsList, 
    isLoading, 
    friendsError 
}) => {
    const [leaderboardData, setLeaderboardData] = useState<FriendLeaderboardUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<FriendLeaderboardUser | null>(null);
    const { getStatusColor } = useFriends();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // Get current user from localStorage
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
    }, []);

    useEffect(() => {
        if (!isLoading && allLeaderboardData && allLeaderboardData.length > 0) {
            // Create a set of friend IDs
            const friendIds = new Set((friendsList ?? []).map(f => f.id).filter(Boolean));
            
            // Filter stats for friends and current user
            const friendStats = allLeaderboardData.filter(user => {
                // Check if user is in friends list
                const isFriend = friendIds.has(user.id);
                
                // Check if user is the current user (convert IDs to strings for comparison)
                const isCurrentUser = currentUser && currentUser.id && 
                    String(user.id) === String(currentUser.id);
                
                return isFriend || isCurrentUser;
            });

            const friendLeaderboardUsers: FriendLeaderboardUser[] = friendStats.map(stat => {
                // Find friend details if it's a friend
                const friendDetails = friendsList?.find(f => f.id === stat.id);
                // Check if this is the current user
                const isCurrentUser = currentUser && currentUser.id && 
                    String(stat.id) === String(currentUser.id);
                
                return {
                    ...stat, 
                    status: friendDetails?.status || (isCurrentUser ? 'ONLINE' : null),
                    rank: 0, 
                };
            });

            // Sort by the selected statistic (highest first)
            friendLeaderboardUsers.sort((a, b) => {
                const statA = a[selectedStatistic as keyof FriendLeaderboardUser] as number | undefined || 0;
                const statB = b[selectedStatistic as keyof FriendLeaderboardUser] as number | undefined || 0;
                return statB - statA;
            });

            // Update rank based on sorted order
            friendLeaderboardUsers.forEach((user, index) => {
                user.rank = index + 1;
            });

            setLeaderboardData(friendLeaderboardUsers);
        } else if (!isLoading) { 
            setLeaderboardData([]);
        }
    }, [allLeaderboardData, friendsList, selectedStatistic, isLoading, currentUser]);

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
            title: "Player",
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
                    {username} {currentUser && currentUser.id && String(record.id) === String(currentUser.id) ? "(You)" : ""}
                </div>
            ),
        },
        {
            title: statisticDisplayNames[selectedStatistic],
            dataIndex: selectedStatistic,
            key: selectedStatistic,
            render: (value: number | undefined) => value !== undefined ? value : 'N/A', // should always be present but acts as a failsave
        },
    ];

    if (isLoading) {
        return <div className="flex justify-center py-8"><Spin size="large" /></div>;
    }

    if (friendsError) {
        return (
            <Alert
                message="Error loading friends data"
                description={friendsError}
                type="error"
                showIcon
            />
        );
    }

    if (leaderboardData.length === 0) {
        return (
            <Alert
                message="No data available"
                description="Add friends to compare rankings or check your profile stats"
                type="info"
                showIcon
                style={{ fontSize: '0.85rem' }}
            />
        );
    }

    // Check if we only have the current user (no friends)
    const hasOnlyCurrentUser = leaderboardData.length === 1 && currentUser && currentUser.id && 
        String(leaderboardData[0].id) === String(currentUser.id);
    if (hasOnlyCurrentUser) {
        return (
            <>
                <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
                    <Table
                        dataSource={leaderboardData} 
                        columns={columns}
                        rowKey="id"
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
                <div className="mt-2 text-sm text-gray-400">
                    <p>Add friends to compare your statistics with them.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
                <Table
                    dataSource={leaderboardData} 
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
                    user={selectedUser as any} // Casting to any for now, should be fixed if UserProfileCard expects a specific User type
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