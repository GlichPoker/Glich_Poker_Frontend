"use client";
import React, { useEffect, useState } from "react";
import { Table, Spin, Button, Popover, App } from "antd";
import { UserOutlined, TrophyOutlined, UserAddOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import { useFriends } from "@/hooks/useFriends";
import { User } from "@/types/user";
import "@ant-design/v5-patch-for-react-19";
import UserProfileCard from "@/components/friends/UserProfileCard";

interface LeaderboardUser extends User {
    score: number; 
    rank: number;
}

const GlobalLeaderboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
    const apiService = useApi();
    const { 
        friends, 
        availableUsers, 
        pendingRequests, 
        addFriend,
        refreshFriendsData
    } = useFriends();
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
                
                // Refresh friends data to know relationships
                await refreshFriendsData();

                // For now, we'll add a random score to each user since the backend doesn't have a scoring system yet
                const leaderboardUsers: LeaderboardUser[] = users.map((user, index) => ({
                    ...user,
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
    }, [apiService, refreshFriendsData]);

    // Determine relationship with a user (for action button)
    const getUserActionButton = (user: LeaderboardUser) => {
        // Don't show anything for the current user
        if (currentUser && user.id === currentUser.id) {
            return null;
        }
        
        // If no ID, can't take action
        if (!user.id) {
            return null;
        }

        // Check if they're already a friend
        const isFriend = friends.some(friend => friend.id === user.id);
        if (isFriend) {
            return <span className="text-green-500 text-xs">Friend</span>;
        }
        
        // Check if there's a pending request
        const isPending = pendingRequests.some(request => request.id === user.id);
        if (isPending) {
            return <span className="text-orange-500 text-xs">Request Pending</span>;
        }
        
        // Check if they're available to add
        const isAvailable = availableUsers.some(availUser => availUser.id === user.id);
        if (isAvailable) {
            return (
                <Button
                    type="text"
                    size="small"
                    icon={<UserAddOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSendRequest(user);
                    }}
                >
                    Add
                </Button>
            );
        }
        
        return null;
    };

    // Handle sending a friend request
    const handleSendRequest = async (user: LeaderboardUser) => {
        if (!user.id) {
            message.error("Cannot send friend request: Invalid user ID");
            return;
        }
        
        const result = await addFriend(user.id);
        if (result.success) {
            message.success(result.message);
            await refreshFriendsData();
        } else {
            message.error(result.message);
        }
    };

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
            title: "Score",
            dataIndex: "score",
            key: "score",
        },
        {
            title: "Action",
            key: "action",
            width: "100px",
            render: (_: any, record: LeaderboardUser) => getUserActionButton(record),
        }
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
                            cell: (props) => (
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
                            row: (props) => (
                                <tr
                                    {...props}
                                    style={{
                                        backgroundColor: '#18181B', // zinc-900
                                    }}
                                />
                            ),
                            cell: (props) => (
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
                onOpenChange={(visible) => !visible && setSelectedUser(null)}
                trigger="click"
                placement="right"
            />
        </>
    );
};

export default GlobalLeaderboard;