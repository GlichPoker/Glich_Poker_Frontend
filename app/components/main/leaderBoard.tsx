"use client";
import React, { useState } from "react";
import { TrophyOutlined } from "@ant-design/icons";
import { Button } from "antd";

import "@ant-design/v5-patch-for-react-19";
import GlobalLeaderboard from "@/components/main/leaderboard/global";
import FriendLeaderboard from "@/components/main/leaderboard/friends";

const Leaderboard: React.FC = () => {
  const [activeLeaderboard, setActiveLeaderboard] = useState<'global' | 'friends'>('global');

  return (
    <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <TrophyOutlined className="text-yellow-500 mr-2 text-lg" />
          <h2 className="text-lg font-bold text-white">
            {activeLeaderboard === 'global' ? 'Global Leaderboard' : 'Friends Leaderboard'}
          </h2>
        </div>
        <div className="flex space-x-2">
          <Button
            type={activeLeaderboard === 'global' ? 'primary' : 'default'}
            onClick={() => setActiveLeaderboard('global')}
            size="small"
          >
            Global
          </Button>
          <Button
            type={activeLeaderboard === 'friends' ? 'primary' : 'default'}
            onClick={() => setActiveLeaderboard('friends')}
            size="small"
          >
            Friends
          </Button>
        </div>
      </div>
      {activeLeaderboard === 'global' ? (
        <GlobalLeaderboard />
      ) : (
        <FriendLeaderboard />
      )}
    </div>
  );
};


export default Leaderboard;