// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx


"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useParams, useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, Card, Select } from "antd";
import "@ant-design/v5-patch-for-react-19"; //!put into every page for react19 to work
import React, { useEffect, useState } from "react";
// Optionally, you can import a CSS module or file for additional styling:
//import styles from "@/styles/page.module.css";

interface FormFieldProps {
  username: string;
  birthDate?: string;
  status: string;
}

/*
async function fetchData(id:string) {
    const response = await fetch(`/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user with ID ${id}`);
    }
    return await response.json();
  }
*/

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const { value: token } = useLocalStorage<string>("token", "");
  const [form] = Form.useForm();

  const saveUserdata = async (values: FormFieldProps) => {
    try{
      const { username, birthDate, status } = values;
      const payload = {username, birthDate, status};

      const userid = params.id as string;
      await apiService.put<User>(`/users/${userid}`, payload);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during while editing:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  useEffect(() => {
    //TODO: If necessary check for token to initiate a redirect

    const fetchUser = async () => {
      try{
        const userid = params.id as string;
        const user: User = await apiService.get<User>(`/users/${userid}`);
        setUser(user);
      } catch (error) {
        console.error("Faild to fetch userdata:", error);
      }
    };

    fetchUser();
  }, [params.id, apiService, token, router]);

  if (!user) return <div>User not found</div>;

  return (
    <div className="login-container">
      <Form
        form={form}
        onFinish={saveUserdata}
      >
        
        <Card title = "User Profile">
          <Form.Item 
            name="username" 
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
            initialValue={user.username}
            >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item 
            name="birthDate" 
            label="Birthday"
            rules={[
              { required: false, message: "Please enter your birthday!" },
              {
                validator(_, value) {
                  // Regular expression for yyyy-mm-dd format
                  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                  
                  if (!value || dateRegex.test(value)) {
                    // Now check if it's actually a valid date
                    if (value) {
                      const date = new Date(value);
                      if (isNaN(date.getTime())) {
                        return Promise.reject(new Error('Please enter a valid date'));
                      }
                    }
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Date must be in yyyy-mm-dd format'));
                },
              }
            ]}
            initialValue={user.birthDate}
            >
            <Input placeholder="Enter Birthday (yyyy-mm-dd)" />
          </Form.Item>
          <Form.Item 
            name="status" 
            label="Status"
            rules={[{ required: true, message: "Please select your status!" }]}
            initialValue={user.status}
          >
            <Select placeholder="Select status">
              <Select.Option value="ONLINE">ONLINE</Select.Option>
              <Select.Option value="OFFLINE">OFFLINE</Select.Option>
            </Select>
          </Form.Item>
          <p><strong>Account creation date: </strong> {user.creationDate}</p>
        </Card>

        <Button type="default" htmlType="submit" className = "userdata-form" onClick={() => router.push(`/users/${user.id}`)}>
          save
        </Button>
      </Form>
    </div>
  );
};

export default Profile;
