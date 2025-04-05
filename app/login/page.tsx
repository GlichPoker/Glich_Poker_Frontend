"use client";
import { useRouter } from "next/navigation";
import { Button, Form, Input, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useState } from "react";
import "@ant-design/v5-patch-for-react-19";

interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginFormProps {
  onSwitchView: () => void;
}

const Login = ({ onSwitchView }: LoginFormProps) => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  // useLocalStorage로 token과 user 상태 관리
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUser } = useLocalStorage<User>("user", {} as User);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await apiService.post<User>("/users/login", values);
      if (response.token) {
        // Set token and user data in localStorage using useLocalStorage hook
        setToken(response.token);
        setUser(response); // Save user data using useLocalStorage hook

        // You don't need to manually call localStorage.setItem() anymore
        message.success(`Welcome back, ${response.username || 'User'}!`);
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

  return (
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
          <Button className="!text-white" type="link" htmlType="button" onClick={onSwitchView}>
            No account yet?
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;