"use client";
import React, { useState, useEffect } from "react";
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
    const [processingIds, setProcessingIds] = useState<string[]>([]);
    const { message, notification } = App.useApp();

    // Refresh friend data when dropdown is opened
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            refreshFriendsData();
        }
    };

    // Helper to check if a request is being processed
    const isProcessing = (id: string | null) => {
        return id !== null && processingIds.includes(id);
    };

    // Handle accepting a friend request
    const handleAccept = async (friendId: string | null) => {
        if (!friendId) {
            message.error("Cannot accept request: Invalid ID");
            return;
        }
        
        // Set this request to processing state
        setProcessingIds(prev => [...prev, friendId]);
        
        try {
            const result = await acceptFriendRequest(friendId);
            if (result.success) {
                message.success(result.message);
                // Remove from processing immediately after success
                setProcessingIds(prev => prev.filter(id => id !== friendId));
            } else {
                message.error(result.message);
                // Remove from processing after error
                setProcessingIds(prev => prev.filter(id => id !== friendId));
            }
        } catch (error) {
            console.error("Error accepting friend request:", error);
            message.error("An unexpected error occurred");
            // Remove from processing after exception
            setProcessingIds(prev => prev.filter(id => id !== friendId));
        }
    };

    // Handle denying a friend request
    const handleDeny = async (friendId: string | null) => {
        if (!friendId) {
            message.error("Cannot deny request: Invalid ID");
            return;
        }
        
        // Set this request to processing state
        setProcessingIds(prev => [...prev, friendId]);
        
        try {
            const result = await denyFriendRequest(friendId);
            if (result.success) {
                message.success(result.message);
                // Remove from processing immediately after success
                setProcessingIds(prev => prev.filter(id => id !== friendId));
            } else {
                message.error(result.message);
                // Remove from processing after error
                setProcessingIds(prev => prev.filter(id => id !== friendId));
            }
        } catch (error) {
            console.error("Error denying friend request:", error);
            message.error("An unexpected error occurred");
            // Remove from processing after exception
            setProcessingIds(prev => prev.filter(id => id !== friendId));
        }
    };

    // Show notification when new requests arrive
    useEffect(() => {
        if (pendingRequests && pendingRequests.length > 0) {
            if (!open) { // Only show if the popover is closed
                notification.info({
                    message: 'New Friend Requests',
                    description: `You have ${pendingRequests.length} pending friend request(s)`,
                    placement: 'topRight',
                });
            }
        }
    }, [pendingRequests, notification, open]);

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