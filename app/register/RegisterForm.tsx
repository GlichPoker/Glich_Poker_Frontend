"use client";
import { useRouter } from "next/navigation";
import { Button, Form, Input, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import useLocalStorage from "@/hooks/useLocalStorage";
import "@ant-design/v5-patch-for-react-19";

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
  
  const { set: setToken } = useLocalStorage<string>("token", "");
  
  const handleRegistration = async (values: RegisterFormValues) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const { username, password } = values;
      const payload = { username, password };
      
      const response = await apiService.post<User>("/users", payload);

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }
      // Navigate to the user overview
      message.success("Welcome to Glich Poker!");
      router.push("/lobbylist");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("409")) {
          message.error("The username is already taken");
        } else {
          message.error(`Something went wrong during registration:\n${error.message}`);
        }
      } else {
        message.error("An unknown error occurred.");
      }
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
          <Button type="primary" htmlType="submit" className="main-btn">
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