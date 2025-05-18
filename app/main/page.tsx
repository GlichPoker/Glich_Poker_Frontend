"use client";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, message, Popover, App } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { webSocketService } from "@/utils/websocket";

import Leaderboard from "@/components/main/leaderboard/leaderboard";
import LobbyList from "@/components/main/lobbyList";
import Chat from "@/components/main/chat";
import FriendsStatus from "@/components/main/friendsStatus";
import UnifiedNotificationCenter from "@/components/friends/UnifiedNotificationCenter";
import UserProfileCard from "@/components/friends/UserProfileCard";

const MainContent: React.FC = () => {
    const router = useRouter();
    const { clear: clearToken } = useLocalStorage<string>("token", "");
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileVisible, setProfileVisible] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    // Check authentication status
    useEffect(() => {
        const localStorageToken = localStorage.getItem("token");

        // If no token, redirect immediately
        if (!localStorageToken) {
            router.replace("/"); // Redirect to login page
            messageApi.error("Please login first");
            return;
        }

        // Proceed if token exists
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString); // Parse user data
                setUser(userData);
            } catch (error) {
                console.error("Failed to parse user data:", error);
                messageApi.error("Error loading user data");
                // Clear invalid data and redirect
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                router.replace("/"); // Redirect to login page
            }
        }

        // Set loading state to false after the token check is done
        setIsLoading(false);
    }, [router, message]);

    // Render nothing or a loading spinner until the token check is done
    if (isLoading) {
        return null; // Or render a loading spinner if you prefer
    }

    const handleLogout = () => {
        if (user && user.username) {
            webSocketService.sendLogoutMessage(user.username);
        }

        // Clear token and user data
        clearToken();
        localStorage.removeItem("user");

        messageApi.success("Logged out successfully");
        router.push("/"); // Redirect to login page
    };

    const handleProfileClick = () => {
        setProfileVisible(!profileVisible);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#181818]">
            {contextHolder}
            {/* nav bar */}
            <nav className="flex flex-row h-14 justify-between items-center bg-[#181818]">
                <div className="flex flex-row !w-60 justify-start items-center gap-x-4 !ml-5 text-white text-xl font-bold"> Glitch Poker</div>

                <div className="flex flex-row justify-end items-center w-[90%] h-[40px] bg-[#181818] gap-x-4 !mr-5">

                    <UnifiedNotificationCenter />

                    <Popover
                        content={user && <UserProfileCard 
                            user={user} 
                            onClose={() => setProfileVisible(false)}
                            sourceContext="profileView" 
                        />}
                        title="My Profile"
                        trigger="click"
                        open={profileVisible}
                        onOpenChange={setProfileVisible}
                        placement="bottomRight"
                    >
                        <UserOutlined
                            className="!text-gray-400 !text-[24px] cursor-pointer"
                            onClick={handleProfileClick}
                        />
                    </Popover>

                    <LogoutOutlined
                        className="!text-gray-400 !text-[24px] cursor-pointer"
                        onClick={handleLogout}
                    />
                </div>
            </nav>

            {/* play section */}
            <div
                className="flex flex-row h-50 justify-center items-center bg-[#181818] text-white bg-[url('/images/main.jpg')] bg-cover bg-center relative"
            >
                <div className="absolute inset-0 bg-black opacity-70"></div>
                <div className="flex flex-row h-16 text-white justify-evenly w-full z-10">
                    <Button
                        type="primary"
                        onClick={() => {
                            router.push("/main/game-rule");
                        }}
                    >
                        Game rule
                    </Button>
                    <Button type="primary" onClick={() => {
                        router.push("/main/create-lobby");
                    }}>
                        Create a Lobby
                    </Button>
                </div>
            </div>

            {/* main content - grows to fill available space */}
            <div className="flex-grow flex justify-center items-start py-4 bg-[#181818]">
                <div className="grid grid-cols-1 md:grid-cols-16 gap-4 w-full max-w-[1600px]"> {/* Increased width from max-w-screen-xl to max-w-[1600px] */}
                    {/* left column - friends' online status, text chat */}
                    <div className="flex flex-col gap-4 md:col-span-3">
                        <div className="h-[400px] border border-zinc-700 overflow-y-auto rounded-lg">
                            <FriendsStatus />
                        </div>
                        <div className="flex justify-center h-[300px] border border-zinc-700 rounded-lg">
                            <Chat />
                        </div>
                    </div>

                    {/* middle column - game lobbies */}
                    <div className="flex flex-col border border-zinc-800 rounded-lg p-4 md:col-span-8">
                        <LobbyList />
                    </div>

                    {/* right column - leaderboard and future components */}
                    <div className="flex flex-col gap-4 md:col-span-5">
                        {/* Leaderboard in a box with same height as friends component */}
                        <div className="border border-zinc-800 rounded-lg p-4 h-[400px] overflow-hidden">
                            <Leaderboard />
                        </div>
                        {/* Empty space for future components */}
                        <div className="border border-zinc-800 rounded-lg p-4 flex-grow">
                            {/* Future component will go here */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Main: React.FC = () => {
    return (
        <App>
            <MainContent />
        </App>
    );
};

export default Main;

