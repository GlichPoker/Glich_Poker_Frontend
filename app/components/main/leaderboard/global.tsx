"use client";
import React, { useEffect, useState } from "react";
import { Table, Spin, Popover, App } from "antd";
import { UserOutlined, TrophyOutlined } from "@ant-design/icons";
import { User } from "@/types/user";
import "@ant-design/v5-patch-for-react-19";
import UserProfileCard from "@/components/friends/UserProfileCard";
import { LeaderboardStatistic, statisticDisplayNames, LeaderboardUser } from "./leaderboard";

interface GlobalLeaderboardProps {
    selectedStatistic: LeaderboardStatistic;
    leaderboardData: LeaderboardUser[];
    isLoading: boolean;
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ selectedStatistic, leaderboardData, isLoading }) => {
    const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
    const { message } = App.useApp();
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        try {
            const userDataString = localStorage.getItem("user");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setCurrentUser(userData);
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }, []);

    const columns = [
        {
            title: "Rank",
            dataIndex: "rank",
            key: "rank",
            width: "80px",
            sorter: (a: LeaderboardUser, b: LeaderboardUser) => a.rank - b.rank,
            render: (rank: number) => (
                <div className="flex items-center">
                    {rank <= 3 ? (
                        <TrophyOutlined className={`text-lg ${rank === 1 ? "text-yellow-500" :
                                rank === 2 ? "text-gray-400" :
                                    "text-amber-700"
                            }`} />
                    ) : null}
                    <span className="ml-2">{rank}</span>
                </div>
            ),
        },
        {
            title: "Player",
            dataIndex: "username",
            key: "username",
            render: (username: string, record: LeaderboardUser) => (
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full mr-2 text-gray-700">
                        <UserOutlined />
                    </div>
                    {/* Display current user differently if needed, e.g., (You) */}
                    {username} {currentUser && record.id === currentUser.id ? "(You)" : ""}
                </div>
            ),
        },
        {
            title: statisticDisplayNames[selectedStatistic],
            dataIndex: selectedStatistic,
            key: selectedStatistic,
            render: (value: number | undefined) => value !== undefined ? value : 'N/A', // Display N/A if stat is not present
        },
    ];

    if (isLoading) {
        return <div className="flex justify-center py-8"><Spin size="large" /></div>;
    }

    return (
        <>
            <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
                <Table
                    dataSource={leaderboardData}
                    columns={columns}
                    rowKey="id" // Ensure this matches a unique string property in LeaderboardUser
                    pagination={false}
                    className="leaderboard-table"
                    rowClassName="bg-zinc-900 hover:bg-zinc-700"
                    size="small"
                    sticky={{ offsetHeader: 0 }}
                    style={{ 
                        backgroundColor: '#18181B' 
                    }}
                    components={{
                        header: {
                            cell: (props: React.HTMLAttributes<HTMLElement>) => (
                                <th
                                    {...props}
                                    style={{
                                        backgroundColor: '#27272A', 
                                        color: 'white',
                                        borderBottom: '1px solid #3F3F46', 
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}
                                />
                            ),
                        },
                        body: {
                            row: (props: React.HTMLAttributes<HTMLElement>) => (
                                <tr
                                    {...props}
                                    style={{
                                        backgroundColor: '#18181B',
                                    }}
                                />
                            ),
                            cell: (props: React.HTMLAttributes<HTMLElement>) => (
                                <td
                                    {...props}
                                    style={{
                                        borderBottom: '1px solid #3F3F46',
                                        color: '#D4D4D8' 
                                    }}
                                />
                            ),
                        },
                    }}
                    onRow={(record) => ({
                        onClick: () => setSelectedUser(record),
                        style: { cursor: 'pointer' }
                    })}
                />
            </div>

            <Popover
                content={selectedUser && <UserProfileCard 
                    user={selectedUser} 
                    onClose={() => setSelectedUser(null)} 
                    sourceContext="globalLeaderboard"
                />}
                title="User Profile"
                open={!!selectedUser}
                onOpenChange={(visible: boolean) => !visible && setSelectedUser(null)}
                trigger="click"
                placement="right"
            />
        </>
    );
};

export default GlobalLeaderboard;