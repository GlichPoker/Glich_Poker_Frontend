"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd";
import "@ant-design/v5-patch-for-react-19"; //!put into every page for react19 to work
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  username: string;
  password: string;
  confirmPassword?: string; // Optional if you have this field
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    // value: token, // is commented out because we do not need the token value
    set: setToken, // we need this method to set the value of the token to the one we receive from the POST request to the backend server API
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");

  const handleRegistration = async (values: FormFieldProps) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const { username, password } = values;
      const payload = { username, password };

      const response = await apiService.post<User>("/users", payload);

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
        console.log("Token stored: ", response.token);
      }

      // Navigate to the user overview
      message.success("Welcome to Glich Poker!");
      router.push("/lobbylist");
    } catch (error: unknown) {
      // error가 Error 인스턴스인지 확인
      if (error instanceof Error) {
        if (error.message.includes("409")) {
          // 409 상태 코드 처리
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
          dependencies={['password']} // this makes the rule re-run if the password changes
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("The two passwords do not match!"));
              },
            }),
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
          <Button type="default" danger htmlType="button" className="w-full" onClick={() => router.push("/login")}>
            Go back to Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;