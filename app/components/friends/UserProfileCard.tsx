"use client";
import React, { useState } from "react";
import { Card, Avatar, Button, App } from "antd";
import { UserOutlined, UserAddOutlined, CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import { User } from "@/types/user";
import { useFriends } from "@/hooks/useFriends";

interface UserProfileCardProps {
    user: User;
    onClose?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onClose }) => {
    const { addFriend, availableUsers, refreshFriendsData } = useFriends();
    const { message } = App.useApp();
    const [isLoading, setIsLoading] = useState(false);

    // Check if we can send friend request (user is in available users list)
    const canSendRequest = availableUsers.some(availableUser => 
        availableUser.id === user.id && user.id !== null);

    const handleSendFriendRequest = async () => {
        if (!user.id) {
            message.error("Cannot send friend request: Invalid user ID");
            return;
        }
        
        setIsLoading(true);
        try {
            const result = await addFriend(user.id);
            
            if (result.success) {
                message.success(result.message);
                await refreshFriendsData(); // Make sure the UI updates
                if (onClose) onClose();
            } else {
                message.error(result.message);
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            message.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card 
            className="w-[300px] bg-zinc-800 text-white border-zinc-700"
            actions={[
                canSendRequest ? (
                    <Button 
                        type="primary" 
                        icon={isLoading ? <LoadingOutlined /> : <UserAddOutlined />}
                        onClick={handleSendFriendRequest}
                        className="mx-4 w-full"
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Add Friend'}
                    </Button>
                ) : (
                    <Button 
                        disabled
                        icon={<UserAddOutlined />}
                        className="mx-4 w-full"
                    >
                        Already Friends/Request Sent
                    </Button>
                )
            ]}
            extra={onClose && <CloseOutlined onClick={onClose} className="cursor-pointer" />}
        >
            <div className="flex items-center">
                <Avatar size={64} icon={<UserOutlined />} />
                <div className="ml-4">
                    <h3 className="text-lg font-bold text-white">{user.username}</h3>
                    {user.status && (
                        <p className="text-gray-400">Status: {user.status}</p>
                    )}
                </div>
            </div>
            {user.birthDate && (
                <p className="mt-2 text-gray-400">Birthdate: {user.birthDate}</p>
            )}
            {user.creationDate && (
                <p className="text-gray-400">Joined: {user.creationDate.split('T')[0]}</p>
            )}
        </Card>
    );
};

export default UserProfileCard;