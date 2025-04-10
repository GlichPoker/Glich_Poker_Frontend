"use client";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { UserOutlined, BellOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { webSocketService } from "@/utils/websocket";

import Leaderboard from "@/components/main/leaderboard/leaderboard";
import LobbyList from "@/components/main/lobbyList";
import Chat from "@/components/main/chat";

const Main: React.FC = () => {
    const router = useRouter();
    const { clear: clearToken } = useLocalStorage<string>("token", "");
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status
    useEffect(() => {
        const localStorageToken = localStorage.getItem("token");

        // If no token, redirect immediately
        if (!localStorageToken) {
            router.replace("/"); // Redirect to login page
            message.error("Please login first");
            return;
        }

        // Proceed if token exists
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
            try {
                JSON.parse(userDataString); // Parse user data
            } catch (error) {
                console.error("Failed to parse user data:", error);
                message.error("Error loading user data");
                // Clear invalid data and redirect
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                router.replace("/"); // Redirect to login page
            }
        }

        // Set loading state to false after the token check is done
        setIsLoading(false);
    }, [router]);

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

        message.success("Logged out successfully");
        router.push("/"); // Redirect to login page
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#181818]">
            {/* nav bar */}
            <nav className="flex flex-row h-14 justify-between items-center bg-[#181818]">
                <div className="flex flex-row !w-60 justify-start items-center gap-x-4 !ml-5 text-white text-xl font-bold"> Glitch Poker</div>

                <div className="flex flex-row justify-end w-[90%] h-[40px] bg-[#181818] gap-x-4 !mr-5">
                    <div className="flex items-center !text-gray-400 font-bold">30,000 chips</div> {/* the amount of chips */}
                    <BellOutlined className="!text-gray-400 !text-[24px]" />
                    <UserOutlined
                        className="!text-gray-400 !text-[24px]"
                        onClick={() => router.push("/users")}
                    />
                    <LogoutOutlined
                        className="!text-gray-400 !text-[24px]"
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
                    <Button type="primary">
                        Create a Lobby
                    </Button>
                </div>
            </div>

            {/* main content - grows to fill available space */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#181818]">
                {/* left side - friends' online status, text chat */}
                <div className="flex flex-col md:col-span-1 px-3">
                    <div className="text-white">(TODO)friends online status
                    </div>
                    <div className="flex justify-center h-[300px] border border-zinc-700">
                        <Chat />
                    </div>
                </div>

                {/* right side - leader board, lobby list */}
                <div className="md:col-span-2 px-3 md:pr-5 bg-[#181818]">
                    <Leaderboard />
                    <div className="!mt-10 bg-[#181818]">
                        <LobbyList />
                    </div>
                </div>
            </div>

            {/* footer - always stays at bottom */}
            <footer className="text-center bg-[#181818] text-gray-600 py-4 mt-auto">
                <p>Glitch Poker. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Main;