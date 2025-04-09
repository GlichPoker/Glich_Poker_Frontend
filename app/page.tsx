"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { Button, Modal, Form, Input, message, App } from "antd";
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function Home() {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUser } = useLocalStorage<User>("user", {} as User);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showLoginView, setShowLoginView] = useState(true);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setShowLoginView(true); // Reset to login view when modal closes
    form.resetFields(); // Reset form fields when modal closes
  };

  const toggleView = () => {
    setShowLoginView(!showLoginView);
    form.resetFields(); // Reset form fields when switching views
  };

  const handleLogin = async (values: { username: string; password: string }) => {
    setIsLoading(true);

    try {
      const response = await apiService.post<User>("/users/login", values);
      if (response.token) {
        setToken(response.token);
        setUser(response);
        router.push("/main");
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error("Invalid username or password");
        console.log(error.message)
      } else {
        message.error("An unknown error occurred during login.");
        console.error("An unknown error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (values: { username: string; password: string; confirmPassword: string }) => {
    setIsLoading(true);

    try {
      const { username, password } = values;
      const payload = { username, password };
      const response = await apiService.post<User>("/users", payload);

      if (response.token) {
        setToken(response.token);
        localStorage.setItem("user", JSON.stringify(response));
      }

      router.push("/main");

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("409")) {
          message.error("The username is already taken");
        } else {
          message.error(`Registration failed: ${error.message}`);
        }
      } else {
        message.error("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <App>
      <div className="relative w-full h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/home.jpg')" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-30 bg-black/0">
          <h1 className="text-6xl font-bold text-white">GLICH POKER</h1>
          <p className="text-red-400 italic mt-4">Play with the Devil!</p>
          <Button
            className="home-btn max-w-xs main-btn !mt-10 !text-lg !text-bold"
            type="primary"
            onClick={showModal}
          >
            Enter
          </Button>
        </div>

        <Modal
          className="modal-container"
          title={showLoginView ? "Login" : "Register"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={500}
        >
          {showLoginView ? (
            <div className="center-container">
              <Form
                form={form}
                name="login"
                size="large"
                variant="outlined"
                onFinish={handleLogin}
                layout="vertical"
              >
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[{ required: true, message: "Please input your username!" }]}
                >
                  <Input placeholder="Enter username" />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    className="home-btn"
                    danger
                    htmlType="submit"
                    loading={isLoading}
                  >
                    Login
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button className="!text-white" type="link" htmlType="button" onClick={toggleView}>
                    No account yet?
                  </Button>
                </Form.Item>
              </Form>
            </div>
          ) : (
            <div className="center-container">
              <Form
                form={form}
                name="register"
                size="large"
                variant="outlined"
                onFinish={handleRegistration}
                layout="vertical"
              >
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[{ required: true, message: "Please input your username!" }]}
                >
                  <Input placeholder="Enter username" />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: "Please confirm your password!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("The two passwords do not match!"));
                      }
                    })
                  ]}
                >
                  <Input.Password placeholder="Enter password again" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="home-btn"
                    loading={isLoading}
                  >
                    Register
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button type="default" danger htmlType="button" className="w-full" onClick={toggleView}>
                    Go back to Login
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>
      </div>
    </App>
  );
}