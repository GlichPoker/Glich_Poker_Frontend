//preGameLayout.tsx
import { Button, Modal, List, Tooltip } from 'antd';
// import Vote from '@/components/game/voting/vote';
import MySeat from '@/components/game/mySeat';
import OtherPlayerSeat from '@/components/game/otherPlayerSeat';
import WeatherIcon from "@/components/game/weatherIcon";
import { useState } from 'react';
import { getApiDomain } from '@/utils/domain';
import VoteMap from '@/components/game/voting/voteMap';
import StartVoteButton from '@/components/game/voting/startVoteButton';


interface PreGameLayoutProps {
    lobbyId: string;
    isHost: boolean;
    currentUser: any;
    currentPlayer: any;
    otherPlayers: any[];
    startGame: () => void;
    showVoteOverlay: boolean;
    setShowVoteOverlay: (show: boolean) => void;
    handleExitGame: () => void;
    customRuleText: string | null;
    weatherType?: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY" | "DEFAULT";
    handleInvitePlayer: (userId: number) => void;
    specialRuleText?: string;
    showVoteMapButton: boolean;
    triggerVoteMapButton: () => void;
    pendingWeatherType: "SUNNY" | "RAINY" | "SNOWY" | "CLOUDY" | "DEFAULT" | null;
    isWeatherModalOpen: boolean;
    setIsWeatherModalOpen: (open: boolean) => void;
    gameSettings: any;
    handleDeleteLobby: () => void;
}

const PreGameLayout = ({
    lobbyId,
    isHost,
    currentUser,
    currentPlayer,
    otherPlayers,
    startGame,
    // showVoteOverlay,
    // setShowVoteOverlay,
    handleExitGame,
    customRuleText,
    weatherType,
    handleInvitePlayer,
    specialRuleText,
    showVoteMapButton,
    pendingWeatherType,
    isWeatherModalOpen,
    setIsWeatherModalOpen,
    gameSettings,
    handleDeleteLobby,
}: PreGameLayoutProps) => {
    const [showVoteMap, setShowVoteMap] = useState(false)
    const [applyError, setApplyError] = useState<string | null>(null);
    const [friends, setFriends] = useState<{ id: number; username: string }[]>([]);
    const baseURL = getApiDomain();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const handleStart = async () => {
        await startGame();
    };

    const fetchFriends = async () => {

        if (!currentUser?.id) {
            console.warn("currentPlayer.id is missing");
            return;
        }

        try {
            const response = await fetch(`${baseURL}/friends/allFriends/${currentUser.id}`, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });

            const data = await response.json();

            setFriends(data);
        } catch (err) {
            console.error("Error fetching friends:", err);
        }
    };

    const handleOpenInviteModal = async () => {
        if (!currentUser?.id) {
            console.warn("Invite blocked: currentUser not ready");
            return;
        }

        await fetchFriends();
        setIsInviteModalOpen(true);
    };

    return (
        <div className="flex flex-col w-full h-screen overflow-hidden">
            {/* NAVBAR */}
            <nav className="flex flex-row h-14 justify-between items-center bg-[#181818]">
                {/* left: logo */}
                <div className="text-sm text-gray-500 !ml-4">
                    <span className="text-lg font-bold">Glitch Poker</span>
                </div>

                {/* right: buttons */}
                <div className="flex flex-row space-x-4">
                    {weatherType && <WeatherIcon weatherType={weatherType} />}
                    {isHost && (
                        <div className="flex items-center space-x-2">
                            <Tooltip title="Invite your friends to the lobby" color="gray">
                                <Button
                                    type="link"
                                    className="!text-gray-500 !font-bold"
                                    onClick={handleOpenInviteModal}
                                >
                                    Invite
                                </Button>
                            </Tooltip>
                        </div>
                    )}
                    {showVoteMapButton && (
                        <Tooltip title="Vote for the map you want to play" color="gray">
                            <Button
                                type="link"
                                className="!text-amber-300 !font-bold"
                                onClick={() => setShowVoteMap(true)}
                            >
                                Vote Map
                            </Button>
                        </Tooltip>
                    )}
                    {/* <Button
                        type="link"
                        className="!text-gray-500 !font-bold"
                        onClick={() => setShowVoteOverlay(true)}
                    >
                        Vote
                    </Button> */}
                    {isHost && (
                        <Tooltip title="Delete the lobby" color="gray">
                            <Button
                                type="link"
                                className="!text-gray-500 !font-bold"
                                onClick={handleDeleteLobby}
                            >
                                Delete
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip title="Leave the lobby and go back to main" color="gray">
                        <Button
                            type="link"
                            className="!text-gray-500 !font-bold"
                            onClick={handleExitGame}
                        >
                            Exit
                        </Button>
                    </Tooltip>
                </div>
            </nav>

            {showVoteMapButton && (
                <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm font-medium border-b border-yellow-300">
                    Map voting has started! Cast your vote.
                </div>
            )}
            <VoteMap
                isVisible={showVoteMap}
                onClose={() => setShowVoteMap(false)}
                lobbyId={lobbyId}
                currentUser={currentUser}
            />
            {/* <Vote
                isVisible={showVoteOverlay}
                onClose={() => setShowVoteOverlay(false)}
                lobbyId={lobbyId}
            /> */}
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

            {/* vote result modal */}
            <Modal
                title="Apply Weather Change"
                open={isWeatherModalOpen}
                closable={true}
                onCancel={() => setIsWeatherModalOpen(false)}
                footer={
                    isHost ? [
                        <Button
                            key="apply"
                            type="primary"
                            onClick={async () => {
                                if (!pendingWeatherType || !currentUser?.token) return;

                                try {
                                    const res = await fetch(`${baseURL}/game/settings`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${currentUser.token}`,
                                        },
                                        body: JSON.stringify({
                                            sessionId: lobbyId,
                                            gameSettings: { ...gameSettings, weatherType: pendingWeatherType },
                                        }),
                                    });

                                    if (!res.ok) {
                                        setApplyError("Failed to apply weather setting.");
                                        return;
                                    }

                                    console.log("Weather setting applied");
                                    setApplyError(null);
                                    setIsWeatherModalOpen(false);
                                } catch (err) {
                                    setApplyError("Error connecting to server.");
                                    console.error("Error applying weather:", err);
                                }
                            }}
                        >
                            Apply
                        </Button>,
                    ] : null
                }
            >
                <p>The voted weather is <strong>{pendingWeatherType}</strong>.</p>
                {!isHost && <p>Waiting for the host to apply the weather...</p>}
                {applyError && <p className="text-red-500 mt-2">{applyError}</p>}
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
                                weatherType={weatherType}
                            />
                        )}
                        {otherPlayers[0] && (
                            <OtherPlayerSeat
                                key={0}
                                player={otherPlayers[0]}
                                positionLabel="Bottom Left"
                                weatherType={weatherType}
                            />
                        )}
                    </div>

                    {/* Poker Table Details + Host Start Button */}
                    <div className="flex flex-col items-center justify-between w-[33.33%] text-white">
                        <div className="rounded-lg p-4 mb-4 text-center">
                            <p className="!mt-30">{customRuleText}</p>
                            {isHost ? (
                                <>
                                    <div>
                                        <Button
                                            type="primary"
                                            className="!mt-10"
                                            onClick={handleStart}
                                        >
                                            Start Game
                                        </Button>
                                    </div>
                                    <div>
                                        <StartVoteButton
                                            lobbyId={lobbyId}
                                            currentUser={currentUser}
                                        />
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-300 !mt-10">Waiting for host to start the game...</p>
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
                                weatherType={weatherType}
                            />
                        )}
                        {otherPlayers[3] && (
                            <OtherPlayerSeat
                                key={3}
                                player={otherPlayers[3]}
                                positionLabel="Bottom Right"
                                weatherType={weatherType}
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