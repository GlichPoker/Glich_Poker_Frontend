
"use client";
import React, { useState } from "react";
import { Button } from "antd";
import { TrophyOutlined, ReloadOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import GlobalLeaderboard from "@/components/main/leaderboard/global";
import FriendLeaderboard from "@/components/main/leaderboard/friends"; // Add this import

const Leaderboard = () => {
    const [activeLeaderboard, setActiveLeaderboard] = useState<'global' | 'friends'>('global');
    const [refreshKey, setRefreshKey] = useState(0);
    
    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <div className="bg-zinc-800 rounded-lg p-4 shadow-lg h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <TrophyOutlined className="!text-yellow-500 !ml-2 !mr-2 text-xl" />
                    <h2 className="text-xl font-bold text-white">
                        {activeLeaderboard === 'global' ? 'Global Leaderboard' : 'Friends Leaderboard'}
                    </h2>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        type={activeLeaderboard === 'global' ? 'primary' : 'default'}
                        onClick={() => setActiveLeaderboard('global')}
                    >
                        Global
                    </Button>
                    <Button
                        type={activeLeaderboard === 'friends' ? 'primary' : 'default'}
                        onClick={() => setActiveLeaderboard('friends')}
                    >
                        Friends
                    </Button>
                    <Button 
                        type="text" 
                        icon={<ReloadOutlined className="text-white" />} 
                        onClick={handleRefresh}
                        className="text-white hover:text-white"
                        style={{ color: 'white' }}
                        title="Refresh"
                    />
                </div>
            </div>
            {activeLeaderboard === 'global' ? (
                <GlobalLeaderboard key={`global-${refreshKey}`} />
            ) : (
                <FriendLeaderboard key={`friends-${refreshKey}`} />
            )}
        </div>
    );
};

export default Leaderboard;