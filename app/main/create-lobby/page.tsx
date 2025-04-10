"use client";
import React, { useState, useEffect } from 'react';
import { Button, Input, Form, message, Radio } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const CreateGame = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData && userData.id) {
          setUserId(userData.id);
          setUserToken(userData.token);
          console.log('User info retrieved:', { id: userData.id, token: userData.token });
        } else {
          console.error('User ID not found in user data');
          message.error('User ID not found. Please login again.');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        message.error('Error retrieving user information');
      }
    } else {
      console.error('User data not found in localStorage');
      message.error('User data not found. Please login again.');
    }
  }, []);


  const handleCreateGame = async (values: any) => {
    if (!userId || !userToken) {
      message.error('User information not found. Please login again.');
      return;
    }

    try {
      const { gameName, maxPlayers, smallBlind, bigBlind, password } = values;


      const gameSettings = {
        initialBalance: 1000,
        smallBlind: parseInt(smallBlind),
        bigBlind: parseInt(bigBlind)
      };


      const requestBody = {
        gameSettings,
        userId,
        isPublic: !isPrivate,
      };


      const response = await axios.post('http://localhost:8080/game/create', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      // 게임 생성 성공 시 메시지와 함께 게임 로비로 이동
      message.success('Game created successfully!');
      console.log('Game created:', response.data);

      router.push(`/lobby/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating game:', error);

      if (error.response) {
        // server returns response
        console.error('Error response:', error.response);
        message.error(`Server error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        // request sent but not recieved response
        console.error('Error request:', error.request);
        message.error('No response received from server. Please check if server is running.');
      } else {
        // request error
        message.error(`Request error: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#181818] text-white">
      <div className="w-full max-w-lg p-6 rounded-lg shadow-md">
        <h1 className="text-center text-xl font-bold mb-6">Create New Poker Game</h1>

        {userId ? (
          <>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateGame}
              initialValues={{
                maxPlayers: 5,
                smallBlind: 10,
                bigBlind: 20,
              }}
            >
              {/* Lobby Name */}
              <Form.Item
                label="Lobby Name"
                name="gameName"
                rules={[{ required: true, message: 'Please enter a lobby name' }]}
              >
                <Input placeholder="Enter Lobby Name" />
              </Form.Item>

              {/* Maximum Number of Players */}
              <Form.Item
                label="Maximum Number of Players"
                name="maxPlayers"
                rules={[{ required: true, message: 'Please enter maximum players' }]}
              >
                <Input type="number" min={2} max={10} placeholder="Enter maximum number of players" />
              </Form.Item>

              {/* Small Blind */}
              <Form.Item
                label="Small Blind"
                name="smallBlind"
                rules={[{ required: true, message: 'Please enter small blind amount' }]}
              >
                <Input type="number" min={1} placeholder="Enter Small Blind" />
              </Form.Item>

              {/* Big Blind */}
              <Form.Item
                label="Big Blind"
                name="bigBlind"
                rules={[{ required: true, message: 'Please enter big blind amount' }]}
              >
                <Input type="number" min={2} placeholder="Enter Big Blind" />
              </Form.Item>

              {/* Public or Private selection */}
              <Form.Item label="Game Type" name="gameType">
                <Radio.Group
                  onChange={(e) => setIsPrivate(e.target.value === 'private')}
                  defaultValue="public"
                >
                  <Radio value="public">Public</Radio>
                  <Radio value="private">Private</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Password input field shown only if 'Private' is selected */}
              {isPrivate && (
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: isPrivate, message: 'Please enter a password for private game' }]}
                >
                  <Input.Password placeholder="Enter a password" />
                </Form.Item>
              )}

              {/* Create Button */}
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Create Game
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <div className="text-center p-4">
            <p className="text-yellow-500 mb-4">Loading user information...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateGame;