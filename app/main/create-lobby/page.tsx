"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, Form, message, Radio } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getApiDomain } from "@/utils/domain";

const baseURL = getApiDomain();

const CreateGame = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

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

  const handleCreateGame = async (values: any) => {
    if (!userId || !userToken) {
      messageApi.error('User info not found. Please login again.');
      return;
    }

    try {
      const { smallBlind, bigBlind } = values;


      const response = await axios.post(
        `${baseURL}/game/create`,
        {
          userId,
          isPublic: !isPrivate,
          gameSettings: {
            initialBalance: 1000,
            smallBlind: parseInt(smallBlind),
            bigBlind: parseInt(bigBlind),
          },
        },
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
            initialValues={{ smallBlind: 10, bigBlind: 20, gameType: "public" }}
          >
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