"use client";
import React, { useState, useEffect } from "react";
import { Button, Select, App } from "antd";
import { TrophyOutlined, ReloadOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import GlobalLeaderboard from "@/components/main/leaderboard/global";
import FriendLeaderboard from "@/components/main/leaderboard/friends";
import { useApi } from "@/hooks/useApi";
import { useFriends, FriendWithStatus } from "@/hooks/useFriends";
import { User } from "@/types/user";

const { Option } = Select;

// Define the types for the statistics
export type LeaderboardStatistic = 'bb100' | 'bankrupts' | 'totalBBWon' | 'totalGamesPlayed' | 'totalRoundsPlayed';

// Define display names for the statistics
export const statisticDisplayNames: Record<LeaderboardStatistic, string> = {
    bb100: 'BB/100',
    bankrupts: 'Bankrupts',
    totalBBWon: 'Total BB Won',
    totalGamesPlayed: 'Games Played',
    totalRoundsPlayed: 'Rounds Played',
};

interface BackendPlayerStat {
    userId: number;
    username: string;
    totalBBWon: number;
    totalRoundsPlayed: number;
    bb100: number;
    totalGamesPlayed: number;
    bankrupts: number;
}

export interface LeaderboardUser extends User {
    id: string;
    username: string;
    rank: number;
    // status, birthDate, creationDate, token are inherited from User
    bb100: number;
    bankrupts: number;
    totalBBWon: number;
    totalGamesPlayed: number;
    totalRoundsPlayed: number;
}


const Leaderboard = () => {
    const [activeLeaderboard, setActiveLeaderboard] = useState<'global' | 'friends'>('global');
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedStatistic, setSelectedStatistic] = useState<LeaderboardStatistic>('bb100');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const apiService = useApi();
    const { message } = App.useApp();
    const { friends, loading: friendsLoading, error: friendsError } = useFriends();

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setLoadingData(true);
            try {
                const data = await apiService.get<BackendPlayerStat[]>("/game/stats/all");

                const currentSortStat = selectedStatistic || 'bb100'; // Fallback if selectedStatistic isn't ready

                const sortedData = [...data].sort((a, b) => {
                    const getStat = (item: BackendPlayerStat): number => {
                        const val = item[currentSortStat as keyof BackendPlayerStat];
                        return typeof val === 'number' && isFinite(val) ? val : -Infinity;
                    };

                    const statA = getStat(a);
                    const statB = getStat(b);

                    if (statB !== statA) return statB - statA;

                    // Tie-breakers
                    const nameCompare = a.username.localeCompare(b.username);
                    if (nameCompare !== 0) return nameCompare;

                    return a.userId - b.userId;
                });


                const transformedData: LeaderboardUser[] = sortedData.map((stat, index) => ({
                    id: String(stat.userId),
                    username: stat.username,
                    rank: index + 1, // Assign rank based on the sorted order
                    bb100:
                        typeof stat.bb100 === "number" && isFinite(stat.bb100)
                            ? Number(stat.bb100.toFixed(1))
                            : 0,

                    totalBBWon:
                        typeof stat.totalBBWon === "number" && isFinite(stat.totalBBWon)
                            ? Number(stat.totalBBWon.toFixed(1))
                            : 0,
                    totalRoundsPlayed: stat.totalRoundsPlayed,
                    totalGamesPlayed: stat.totalGamesPlayed,
                    bankrupts: stat.bankrupts,
                    // Initialize inherited User fields
                    birthDate: null,
                    status: null,
                    creationDate: null,
                    token: null
                }));
                setLeaderboardData(transformedData);
            } catch (error) {
                console.error("Failed to fetch leaderboard data:", error);
                message.error("Could not load leaderboard data.");
                setLeaderboardData([]); // Set to empty array on error
            } finally {
                setLoadingData(false);
            }
        };

        fetchLeaderboardData();
    }, [apiService, refreshKey, message, selectedStatistic]);

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
                    <Select
                        value={selectedStatistic}
                        onChange={(value) => setSelectedStatistic(value)}
                        style={{ width: 150, marginRight: 8 }}
                        className="custom-select-style"
                    >
                        {(Object.keys(statisticDisplayNames) as LeaderboardStatistic[]).map(key => (
                            <Option key={key} value={key}>
                                {statisticDisplayNames[key]}
                            </Option>
                        ))}
                    </Select>
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
                <GlobalLeaderboard
                    key={`global-${refreshKey}-${selectedStatistic}`}
                    selectedStatistic={selectedStatistic}
                    leaderboardData={leaderboardData}
                    isLoading={loadingData}
                />
            ) : (
                <FriendLeaderboard
                    key={`friends-${refreshKey}-${selectedStatistic}`}
                    selectedStatistic={selectedStatistic}
                    allLeaderboardData={leaderboardData} // Pass all data
                    friendsList={friends} // Pass friends list
                    isLoading={loadingData || friendsLoading} // Combine loading states
                    friendsError={friendsError} // Pass friends error
                />
            )}
        </div>
    );
};

export default Leaderboard;