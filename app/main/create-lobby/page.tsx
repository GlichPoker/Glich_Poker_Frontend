"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, Form, message, Radio, Divider } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getApiDomain } from "@/utils/domain";
import { useCustomHandRank } from "@/hooks/useCustomHandRank";
import useWeather from "@/hooks/useWeather";

const baseURL = getApiDomain();

const CreateGame = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [winner, setWinner] = useState("descending");
  const { customOrder, DraggableList } = useCustomHandRank();
  const [handRankType, setHandRankType] = useState("default");
  const { emoji, weatherType, loading: weatherLoading, error: weatherError } = useWeather();

  const weatherDescriptions: Record<string, string> = {
    SUNNY:
      "A desert mirage plays tricks on the mind. Once every 5 rounds, you may bluff with a fake or real card. The big blind also increases by 5% every third round.",
    RAINY:
      "Slippery hands lead to mistakes. Once per round, you may exchange one card from your hand.",
    SNOWY:
      "A blanket keeps you warm. You receive 3 hand cards instead of the usual 2.",
    CLOUDY:
      "Fog of war obscures the field. Two community cards stay hidden until the showdown.",
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData?.id) {
          setUserId(userData.id);
          setUserToken(userData.token);
          setUsername(userData.username);
        } else {
          messageApi.error('User ID not found. Please login again.');
        }
      } catch {
        messageApi.error('Error parsing user data');
      }
    } else {
      messageApi.error('User data not found. Please login again.');
    }
  }, []);

  const defaultOrder = [
    "ROYALFLUSH",
    "STRAIGHTFLUSH",
    "FOUROFKIND",
    "FULLHOUSE",
    "FLUSH",
    "STRAIGHT",
    "THREEOFKIND",
    "TWOPAIR",
    "ONEPAIR",
    "HIGHCARD",
  ];
  const reverseOrder = [...defaultOrder].reverse();

  const handleCreateGame = async (values: any) => {
    if (!userId || !userToken) {
      messageApi.error('User info not found. Please login again.');
      return;
    }

    try {
      const { smallBlind, bigBlind, handRank, password } = values;

      let order;
      if (handRank === "reverse") {
        order = reverseOrder;
      } else if (handRank === "custom") {
        order = customOrder;
      } else {
        order = defaultOrder;
      }

      const payload: any = {
        userId,
        isPublic: !isPrivate,
        gameSettings: {
          initialBalance: 1000,
          smallBlind: parseInt(smallBlind),
          bigBlind: parseInt(bigBlind),
          descending: winner === "descending",
          order,
          weatherType: weatherType ?? "SUNNY",
          password: isPrivate ? password : "",
        },
      };

      const response = await axios.post(
        `${baseURL}/game/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      messageApi.success('Game created successfully!');
      router.push(`/lobby/${response.data.sessionId}`);
    } catch (error: any) {
      console.error('Game creation failed:', error);
      if (error.response) {
        messageApi.error(`Server error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      } else {
        messageApi.error('Network or request error');
      }
    }

  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-[#181818] text-white">
      {contextHolder}
      <div className="w-full max-w-lg p-6 rounded-lg shadow-md">
        <h1 className="text-center text-xl font-bold mb-6">Create New Poker Game</h1>

        {userId ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateGame}
            initialValues={{ smallBlind: 10, bigBlind: 20, gameType: "public", winner: "descending", handRank: "default" }}
          >

            {/* basic setting */}
            <Divider className="!border-red-900 font-bold">Basic Setting</Divider>
            <Form.Item
              label="Small Blind"
              name="smallBlind"
              rules={[{ required: true, message: 'Enter small blind' }]}
            >
              <Input type="number" min={1} />
            </Form.Item>

            <Form.Item
              label="Big Blind"
              name="bigBlind"
              rules={[{ required: true, message: 'Enter big blind' }]}
            >
              <Input type="number" min={2} />
            </Form.Item>

            <Form.Item label="Game Type" name="gameType">
              <Radio.Group
                onChange={(e) => setIsPrivate(e.target.value === 'private')}
              >
                <Radio value="public">Public</Radio>
                <Radio value="private">Private</Radio>
              </Radio.Group>
            </Form.Item>
            {isPrivate && (
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: isPrivate, message: 'Enter a password' }]}
              >
                <Input.Password />
              </Form.Item>
            )}

            <Divider className="!border-red-900 font-bold">Weather-Based Special Rules</Divider>

            {/* current weather */}
            {!weatherLoading && !weatherError && emoji && (
              <div className="text-center text-lg text-white mt-4">
                <p className="text-sm text-white">Current Weather</p>
                <div className="text-5xl">{emoji}</div>
                {weatherType && weatherDescriptions[weatherType] && (
                  <p className="text-sm mt-2 text-gray-500 italic max-w-s mx-auto">
                    {weatherDescriptions[weatherType]}
                  </p>
                )}
              </div>
            )}

            <Divider className="!border-red-900 font-bold">Custom rules</Divider>

            {/* custom rules */}
            <Form.Item label="Winner" name="winner" rules={[{ required: true, message: "Select how to decide winners" }]}>
              <Radio.Group onChange={(e) => setWinner(e.target.value)}>
                <Radio value="descending">High Card Wins (Descending)</Radio>
                <Radio value="ascending">Low Card Wins (Ascending)</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Hand Rank" name="handRank" rules={[{ required: true, message: "Select a hand rank rule" }]}
            >
              <Radio.Group onChange={(e) => setHandRankType(e.target.value)}>
                <Radio value="default">Default</Radio>
                <Radio value="reverse">Reverse Hand Rankings</Radio>
                <Radio value="custom">Custom</Radio>
              </Radio.Group>
            </Form.Item>

            {handRankType === "custom" && <DraggableList />}



            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Create Game
              </Button>
            </Form.Item>
            <Form.Item>
              <Button type="default" block onClick={() => router.push("/main")}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <p className="text-center text-yellow-500">Loading user info...</p>
        )}
      </div>
    </div>
  );
};

export default CreateGame;