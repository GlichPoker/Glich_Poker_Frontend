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

const LoginForm = ({ onSwitchView }: LoginFormProps) => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await apiService.post<User>("/users/login", values);
      if (response.token) {
        setToken(response.token);
        router.push("/lobbylist");
      }
    } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong during the login:\n${error.message}`);
        } else {
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
            className="main-btn" 
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

export default LoginForm;