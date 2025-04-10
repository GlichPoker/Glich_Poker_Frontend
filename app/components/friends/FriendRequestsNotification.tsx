"use client";
import React, { useState } from "react";
import { Badge, List, Avatar, Button, Popover, Empty, Spin, App } from "antd";
import { BellOutlined, UserOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useFriends } from "@/hooks/useFriends";

const FriendRequestsNotification: React.FC = () => {
    const {
        pendingRequests,
        loading,
        acceptFriendRequest,
        denyFriendRequest,
        refreshFriendsData
    } = useFriends();
    
    const [open, setOpen] = useState(false);
    const { message } = App.useApp();

    // Refresh friend data when dropdown is opened
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            refreshFriendsData();
        }
    };

    // Handle accepting a friend request
    const handleAccept = async (friendId: string | null) => {
        if (!friendId) {
            message.error("Cannot accept request: Invalid ID");
            return;
        }
        const result = await acceptFriendRequest(friendId);
        if (result.success) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    };

    // Handle denying a friend request
    const handleDeny = async (friendId: string | null) => {
        if (!friendId) {
            message.error("Cannot deny request: Invalid ID");
            return;
        }
        const result = await denyFriendRequest(friendId);
        if (result.success) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    };

    const content = (
        <div className="w-[300px] max-h-[400px] overflow-auto">
            <div className="p-2 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Friend Requests</h3>
            </div>
            
            {loading ? (
                <div className="p-4 flex justify-center">
                    <Spin />
                </div>
            ) : pendingRequests && pendingRequests.length > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={pendingRequests}
                    renderItem={(request) => (
                        <List.Item
                            className="px-4"
                            actions={[
                                <Button 
                                    key="accept" 
                                    type="text" 
                                    icon={<CheckOutlined style={{ color: '#52c41a' }} />} 
                                    onClick={() => handleAccept(request.id)}
                                />,
                                <Button 
                                    key="deny" 
                                    type="text" 
                                    icon={<CloseOutlined style={{ color: '#f5222d' }} />} 
                                    onClick={() => handleDeny(request.id)}
                                />
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={request.username}
                                description="Wants to be your friend"
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Empty 
                    description="No pending friend requests" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    className="my-8"
                />
            )}
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
            placement="bottomRight"
            arrow={false}
            overlayClassName="friend-request-popover"
        >
            <div className="px-2 cursor-pointer">
                <Badge count={pendingRequests?.length || 0} overflowCount={99}>
                    <BellOutlined className="text-xl text-white" />
                </Badge>
            </div>
        </Popover>
    );
};

export default FriendRequestsNotification;