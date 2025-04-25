"use client";
import React, { useState } from "react";
import { List, Avatar, Badge, Spin, Button, Popover, Divider, Empty, App } from "antd";
import { UserOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import { useFriends, FriendWithStatus } from "@/hooks/useFriends";

const FriendsStatus: React.FC = () => {
    const {
        friends,
        loading,
        getStatusColor,
        removeFriend,
        refreshFriendsData
    } = useFriends();
    const [selectedFriend, setSelectedFriend] = useState<FriendWithStatus | null>(null);
    const { message } = App.useApp();

    // Handle removing a friend
    const handleRemoveFriend = async (friendId: string | null) => {
        if (!friendId) {
            message.error("Cannot remove friend: Invalid ID");
            return;
        }
        const result = await removeFriend(friendId);
        if (result.success) {
            message.success(result.message);
            setSelectedFriend(null); // Close the popover
        } else {
            message.error(result.message);
        }
    };

    // Get status text based on friend status
    const getStatusText = (status: string | null): string => {
        if (!status) return 'Unknown';
        
        switch (status.toLowerCase()) {
            case 'online': return 'Online';
            case 'playing': return 'Playing';
            case 'offline': return 'Offline';
            default: return 'Unknown';
        }
    };

    // Render friend details content for popover
    const renderFriendDetails = (friend: FriendWithStatus) => (
        <div className="p-2 min-w-[200px]">
            <div className="flex items-center mb-2">
                <Avatar size="large" icon={<UserOutlined />} />
                <div className="ml-3">
                    <div className="font-bold">{friend.username}</div>
                    <div style={{ color: getStatusColor(friend.status) }}>
                        {getStatusText(friend.status)}
                    </div>
                </div>
            </div>
            
            {friend.status && friend.status.toLowerCase() === 'playing' && friend.inGameId && (
                <Button 
                    type="primary" 
                    size="small" 
                    className="w-full mb-2"
                    onClick={() => {
                        message.info(`Spectate functionality coming soon`);
                    }}
                >
                    Watch Game
                </Button>
            )}
            
            <Button 
                danger 
                size="small" 
                icon={<CloseOutlined />} 
                className="w-full"
                onClick={() => handleRemoveFriend(friend.id)}
            >
                Remove Friend
            </Button>
        </div>
    );

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spin /></div>;
    }

    return (
        <div className="bg-zinc-800 rounded-lg p-4 shadow-lg mb-4 h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Friends</h2>
                <Button 
                    type="text" 
                    icon={<PlusOutlined className="text-white" />} 
                    onClick={refreshFriendsData}
                    className="text-white"
                    title="Refresh"
                />
            </div>

            {friends.length > 0 ? (
                <List
                    dataSource={friends}
                    renderItem={(friend) => (
                        <Popover
                            content={() => renderFriendDetails(friend)}
                            title="Friend Details"
                            trigger="click"
                            open={selectedFriend?.id === friend.id}
                            onOpenChange={(visible) => {
                                if (visible) {
                                    setSelectedFriend(friend);
                                } else if (selectedFriend?.id === friend.id) {
                                    setSelectedFriend(null);
                                }
                            }}
                        >
                            <List.Item 
                                className="cursor-pointer hover:bg-zinc-700 rounded-md px-2 py-1"
                                onClick={() => setSelectedFriend(friend)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Badge 
                                            dot 
                                            color={getStatusColor(friend.status)}
                                            offset={[-5, 28]}
                                        >
                                            <Avatar icon={<UserOutlined />} />
                                        </Badge>
                                    }
                                    title={<span className="text-white">{friend.username}</span>}
                                    description={
                                        <span 
                                            style={{ color: getStatusColor(friend.status) }}
                                            className="text-xs"
                                        >
                                            {getStatusText(friend.status)}
                                            {friend.status && friend.status.toLowerCase() === 'playing' && friend.inGameId && 
                                                ' (In Game)'}
                                        </span>
                                    }
                                />
                            </List.Item>
                        </Popover>
                    )}
                    className="overflow-y-auto max-h-[350px] custom-scrollbar"
                />
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={<span className="text-gray-400">No friends yet</span>}
                    className="my-8"
                />
            )}

            <Divider className="my-3 border-zinc-700" />
            
            <div className="text-center">
                <Button 
                    type="link" 
                    className="text-gray-300 hover:text-white" 
                    onClick={() => message.info("Find Friends in Users section")}
                >
                    Find Friends
                </Button>
            </div>
        </div>
    );
};

export default FriendsStatus;