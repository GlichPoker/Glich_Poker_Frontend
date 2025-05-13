//preGameLayout.tsx
import { Button, Modal, List, Tooltip } from 'antd';
import Vote from '@/components/game/voting/vote';
import MySeat from '@/components/game/mySeat';
import OtherPlayerSeat from '@/components/game/otherPlayerSeat';
import WeatherIcon from "@/components/game/weatherIcon";
import { useState, useEffect } from 'react';
import { getApiDomain } from '@/utils/domain';

interface PreGameLayoutProps {
    lobbyId: string;
    isHost: boolean;
    currentPlayer: any;
    otherPlayers: any[];
    startGame: () => void;
    showVoteOverlay: boolean;
    setShowVoteOverlay: (show: boolean) => void;
    handleExitGame: () => void;
    customRuleText: string | null;
    weatherType?: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY";
    handleInvitePlayer: (userId: number) => void;
}

const PreGameLayout = ({
    lobbyId,
    isHost,
    currentPlayer,
    otherPlayers,
    startGame,
    showVoteOverlay,
    setShowVoteOverlay,
    handleExitGame,
    customRuleText,
    weatherType,
    handleInvitePlayer,
}: PreGameLayoutProps) => {
    const handleStart = async () => {
        await startGame();
    };

    const [friends, setFriends] = useState<{ id: number; username: string }[]>([]);
    const baseURL = getApiDomain();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);


    const fetchFriends = async () => {

        if (!currentPlayer?.id) {
            console.warn("currentPlayer.id is missing");
            return;
        }

        try {
            const response = await fetch(`${baseURL}/friends/allFriends/${currentPlayer.id}`, {
                headers: {
                    Authorization: `Bearer ${currentPlayer.token}`,
                },
            });

            const data = await response.json();

            setFriends(data);
        } catch (err) {
            console.error("Error fetching friends:", err);
        }
    };

    const handleOpenInviteModal = async () => {
        if (!currentPlayer?.id) {
            console.warn("Invite blocked: currentPlayer not ready");
            return;
        }

        await fetchFriends();
        setIsInviteModalOpen(true);
    };

    return (
        <div className="flex flex-col w-full h-auto">
            {/* NAVBAR */}
            <nav className="flex flex-row h-14 justify-between items-center bg-[#181818]">
                {/* left: logo */}
                <div className="text-sm text-gray-500 !ml-4">
                    <span className="text-lg font-bold">Glitch Poker</span>
                </div>

                {/* right: buttons */}
                <div className="flex flex-row space-x-4">
                    {weatherType && <WeatherIcon weatherType={weatherType} />}
                    <div className="flex items-center space-x-2">
                        <Button
                            type="link"
                            className="!text-gray-500 !font-bold"
                            onClick={handleOpenInviteModal}
                        >
                            Invite
                        </Button>
                    </div>
                    <Button
                        type="link"
                        className="!text-gray-500 !font-bold"
                        onClick={() => setShowVoteOverlay(true)}
                    >
                        Vote
                    </Button>
                    <Button
                        type="link"
                        className="!text-gray-500 !font-bold"
                        onClick={handleExitGame}
                    >
                        Exit
                    </Button>
                </div>
            </nav>

            <Vote
                isVisible={showVoteOverlay}
                onClose={() => setShowVoteOverlay(false)}
                lobbyId={lobbyId}
            />
            <Modal
                title="Invite a Friend"
                open={isInviteModalOpen}
                onCancel={() => setIsInviteModalOpen(false)}
                footer={null}
            >
                <List
                    dataSource={friends}
                    locale={{ emptyText: "You have no friends to invite" }}
                    renderItem={(friend) => (
                        <List.Item
                            actions={[
                                <Button
                                    key="invite"
                                    type="primary"
                                    size="small"
                                    onClick={() => {
                                        handleInvitePlayer(friend.id);
                                        setIsInviteModalOpen(false);
                                    }}
                                >
                                    Invite
                                </Button>
                            ]}
                        >
                            {friend.username}
                        </List.Item>
                    )}
                />
            </Modal>

            {/* MAIN GAME VIEW */}
            <div className="bg-[url('/images/poker-table.jpg')] bg-cover bg-center relative min-h-screen">
                <div className="flex flex-row w-full pt-20 pb-8">
                    {/* Player Positions (Top Left & Bottom Left) */}
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {otherPlayers[1] && (
                            <OtherPlayerSeat
                                key={1}
                                player={otherPlayers[1]}
                                positionLabel="Top Left"
                            />
                        )}
                        {otherPlayers[0] && (
                            <OtherPlayerSeat
                                key={0}
                                player={otherPlayers[0]}
                                positionLabel="Bottom Left"
                            />
                        )}
                    </div>

                    {/* Poker Table Details + Host Start Button */}
                    <div className="flex flex-col items-center justify-between w-[33.33%] text-white">
                        <div className="rounded-lg p-4 mb-4 text-center">
                            <h2 className="text-xl font-bold">Poker Table</h2>
                            <p className="!mb-10">Lobby ID: {lobbyId}</p>
                            <p className="!mb-10">{customRuleText}</p>
                            {isHost ? (
                                <Button
                                    type="primary"
                                    className="mt-4"
                                    onClick={handleStart}
                                >
                                    Start Game
                                </Button>
                            ) : (
                                <p className="text-sm text-gray-300">Waiting for host to start the game...</p>
                            )}
                        </div>
                    </div>

                    {/* Player Positions (Top Right & Bottom Right) */}
                    <div className="flex flex-col items-center w-[33.33%] space-y-8">
                        {otherPlayers[2] && (
                            <OtherPlayerSeat
                                key={2}
                                player={otherPlayers[2]}
                                positionLabel="Top Right"
                            />
                        )}
                        {otherPlayers[3] && (
                            <OtherPlayerSeat
                                key={3}
                                player={otherPlayers[3]}
                                positionLabel="Bottom Right"
                            />
                        )}
                    </div>
                </div>

                {/* CURRENT USER */}
                <div className="absolute bottom-20 left-0 right-0 flex justify-center">
                    <MySeat
                        player={currentPlayer}
                        username={currentPlayer?.username}
                    />
                </div>
            </div>
        </div>
    );
};

export default PreGameLayout;