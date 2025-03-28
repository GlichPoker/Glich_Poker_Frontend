"use client";
import { useRouter } from "next/navigation";
import { Button, Form, Input, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import useLocalStorage from "@/hooks/useLocalStorage";
import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";

// Form value interfaces
interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

// Component prop interfaces
interface RegisterFormProps {
  onSwitchView: () => void;
}

const RegisterForm = ({ onSwitchView }: RegisterFormProps) => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  
  const { set: setToken } = useLocalStorage<string>("token", "");
  
  const handleRegistration = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const { username, password } = values;
      const payload = { username, password };
      const response = await apiService.post<User>("/users", payload);

      // Use the useLocalStorage hook that returned a setter function to store the token if available
      if (response.token) { 
        // Set token in localStorage
        setToken(response.token);
        
        // Store user data in localStorage for use in the main page
        localStorage.setItem("user", JSON.stringify(response));
      }
      
      // Navigate to the dashboard instead of lobbylist
      message.success("Welcome to Glich Poker!");
      
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        router.push("/mainpage");
      }, 100);
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
            className="main-btn"
            loading={isLoading}
          >
            Register
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="default" danger htmlType="button" className="w-full" onClick={onSwitchView}>
            Go back to Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterForm;