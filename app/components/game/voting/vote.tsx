"use client";

import { useState } from "react";
import { Button, Modal, Select, Typography, message, Divider } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

interface VoteProps {
  isVisible: boolean;
  onClose: () => void;
  lobbyId: string;
}

const Vote: React.FC<VoteProps> = ({ isVisible, onClose, lobbyId }) => {
  const [voteType, setVoteType] = useState<string>("kick");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedMap, setSelectedMap] = useState<string>("classic");
  const [selectedRule, setSelectedRule] = useState<string>("");
  const [isGamePaused, setIsGamePaused] = useState<boolean>(false);
  
  // TODO: Gather real data. currently: Mock player data - in a real app, these would come from a backend
  const players = [
    { id: "1", name: "Player 1" },
    { id: "2", name: "Player 2" },
    { id: "3", name: "Player 3" },
    { id: "4", name: "Player 4" },
  ];

  const maps = ["tear", "dry", "void", "classic"];
  const specialRules = [
    "Double blinds every 10 minutes",
    "Wild cards (Jokers)",
    "Everyone must show one card",
    "Time limit for decisions (30 sec)",
  ];

  const handleStartVote = () => {
    let voteMessage = "";
    
    switch (voteType) {
      case "kick":
        if (!selectedPlayer) {
          message.error("Please select a player to kick");
          return;
        }
        voteMessage = `Started a vote to kick ${players.find(p => p.id === selectedPlayer)?.name}`;
        break;
      case "map":
        voteMessage = `Started a vote to change map to ${selectedMap}`;
        break;
      case "rules":
        if (!selectedRule) {
          message.error("Please select a special rule");
          return;
        }
        voteMessage = `Started a vote to add rule: ${selectedRule}`;
        break;
      case "pause":
        if (isGamePaused) {
          message.error("The game is already paused");
          return;
        }
        voteMessage = "Started a vote to pause the game";
        setIsGamePaused(true);
        break;
      case "resume":
        if (!isGamePaused) {
          message.error("The game is not paused");
          return;
        }
        voteMessage = "Started a vote to resume the game";
        setIsGamePaused(false);
        break;
      default:
        return;
    }
    
    message.success(voteMessage);
    onClose();
  };

  return (
    <Modal
      title="Start a Vote"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
    >
      <div className="flex flex-col gap-4">
        <div>
          <Text>Select vote type:</Text>
          <Select
            value={voteType}
            onChange={setVoteType}
            className="w-full mt-1"
          >
            <Option value="kick">Kick Player</Option>
            <Option value="map">Change Map</Option>
            <Option value="rules">Special Rules</Option>
            <Option value="pause">Pause Game</Option>
            <Option value="resume">Resume Game</Option>
          </Select>
        </div>

        <Divider />

        {voteType === "kick" && (
          <div>
            <Text>Select player to kick:</Text>
            <Select
              placeholder="Select a player"
              onChange={setSelectedPlayer}
              className="w-full mt-1"
            >
              {players.map(player => (
                <Option key={player.id} value={player.id}>{player.name}</Option>
              ))}
            </Select>
          </div>
        )}

        {voteType === "map" && (
          <div>
            <Text>Select new map:</Text>
            <Select
              value={selectedMap}
              onChange={setSelectedMap}
              className="w-full mt-1"
            >
              {maps.map(map => (
                <Option key={map} value={map}>{map.charAt(0).toUpperCase() + map.slice(1)}</Option>
              ))}
            </Select>
          </div>
        )}

        {voteType === "rules" && (
          <div>
            <Text>Select special rule to add:</Text>
            <Select
              placeholder="Select a special rule"
              onChange={setSelectedRule}
              className="w-full mt-1"
            >
              {specialRules.map(rule => (
                <Option key={rule} value={rule}>{rule}</Option>
              ))}
            </Select>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleStartVote}>
            Start Vote
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Vote;
