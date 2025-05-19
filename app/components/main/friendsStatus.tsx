"use client";
import React, { useState } from "react";
import { List, Avatar, Badge, Spin, Button, Popover, Divider, Empty, App } from "antd";
import { UserOutlined, ReloadOutlined, CloseOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import { useFriends, FriendWithStatus } from "@/hooks/useFriends";
import UserProfileCard from "@/components/friends/UserProfileCard";

const FriendsStatus: React.FC = () => {
    const {
        friends,
        loading,
        getStatusColor,
        refreshFriendsData
    } = useFriends();
    const [selectedFriend, setSelectedFriend] = useState<FriendWithStatus | null>(null);
    const { message } = App.useApp();

    // Get status text based on friend status
    const getStatusText = (friend: FriendWithStatus): string => {
        if (friend.userLobbyStatus === 'IN_LOBBY' && friend.currentLobbyId) {
            return `In Lobby ${friend.currentLobbyId}`;
        }
        if (!friend.status) return 'Unknown';
        
        switch (friend.status.toLowerCase()) {
            case 'online': return 'Online';
            case 'offline': return 'Offline';
            // Fallback for 'playing' if userLobbyStatus is not IN_LOBBY
            case 'playing': return 'Playing'; 
            default: return 'Unknown';
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spin /></div>;
    }

    return (
        <div className="bg-zinc-800 rounded-lg p-4 shadow-lg mb-4 h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white" style={{ paddingLeft: '12px' }}>Friends</h2> {/* Using inline style for padding */}
                <Button 
                    type="text" 
                    icon={<ReloadOutlined className="text-grey" />} 
                    onClick={refreshFriendsData}
                    className="text-grey hover:text-grey"
                    style={{ color: 'white' }}
                    title="Refresh"
                />
            </div>

            {friends.length > 0 ? (
                <List
                    dataSource={friends}
                    split={false} // Added to remove default separators
                    renderItem={(friend) => (
                        <Popover
                            content={() => <UserProfileCard user={friend} onClose={() => setSelectedFriend(null)} />}
                            title={null}
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
                                className="flex items-center cursor-pointer bg-zinc-900 hover:bg-zinc-600 rounded-md px-3 py-2 border border-zinc-600 mb-2" 
                                onClick={() => setSelectedFriend(friend)}
                            >
                                {/* Custom meta structure for vertical alignment */}
                                <div className="flex items-center w-full">
                                    {/* Avatar part */}
                                    <div style={{ marginLeft: '10px', marginRight: '10px' }}>
                                        <Badge 
                                            dot 
                                            color={getStatusColor(friend)}
                                            offset={[-5, 28]}
                                        >
                                            <Avatar icon={<UserOutlined />} />
                                        </Badge>
                                    </div>
                                    {/* Text part (title + description) */}
                                    <div>
                                        <div className="text-white text-base font-semibold leading-tight" style={{ marginBottom: '2px' }}>{friend.username}</div>
                                        <div 
                                            style={{ color: getStatusColor(friend) }}
                                            className="text-xs leading-tight"
                                        >
                                            {getStatusText(friend)}
                                        </div>
                                    </div>
                                </div>
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
            
        </div>
    );
};

export default FriendsStatus;