// this code is part of S2 to display a list of all registered users
// clicking on a user in this list will display /app/users/[id]/page.tsx
"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useFriends } from "@/hooks/useFriends";
import { User } from "@/types/user";
import { Button, Card, Table, Tag, Popover, Avatar, message, App } from "antd";
import type { TableProps } from "antd"; // antd component library allows imports of types
import { UserOutlined, UserAddOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19"; //!put into every page for react19 to work
import UserProfileCard from "@/components/friends/UserProfileCard";
// Optionally, you can import a CSS module or file for additional styling:
// import "@/styles/views/Dashboard.scss";

const DashboardContent: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { message } = App.useApp();
  
  const { 
    friends, 
    availableUsers, 
    pendingRequests, 
    addFriend, 
    refreshFriendsData,
    loading: friendsLoading 
  } = useFriends();

  // useLocalStorage hook example use
  const { clear: clearToken } = useLocalStorage<string>("token", "");

  const handleLogout = (): void => {
    // Clear token using the returned function 'clear' from the hook
    clearToken();
    router.push("/");
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // apiService.get<User[]> returns the parsed JSON object directly,
        // thus we can simply assign it to our users variable.
        const users: User[] = await apiService.get<User[]>("/users");
        setUsers(users);

        // Set current user
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setCurrentUser(userData);
        }

        // Refresh friends data
        refreshFriendsData();

      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Unauthorized") {
            router.push("/login");
          }
          message.error(`Something went wrong while fetching users: ${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
          router.push("/login");
        }
      }
    };

    fetchUsers();
  }, [apiService, router, refreshFriendsData, message]);

  // Get user relationship status
  const getUserRelationship = (userId: string | null) => {
    // Skip if userId is null
    if (!userId) return null;
    
    // Don't show anything for the current user
    if (currentUser && userId === currentUser.id) {
      return null;
    }
    
    // Check if they're already a friend
    const isFriend = friends.some(friend => friend.id === userId);
    if (isFriend) {
      return <Tag color="green">Friend</Tag>;
    }
    
    // Check if there's a pending request
    const isPending = pendingRequests.some(request => request.id === userId);
    if (isPending) {
      return <Tag color="orange">Request Pending</Tag>;
    }
    
    // Check if they're available to add
    const isAvailable = availableUsers.some(availUser => availUser.id === userId);
    if (isAvailable) {
      return (
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSendRequest(userId);
          }}
        >
          Add Friend
        </Button>
      );
    }
    
    return null;
  };

  // Handle sending a friend request
  const handleSendRequest = async (userId: string) => {
    const result = await addFriend(userId);
    if (result.success) {
      message.success(result.message);
      refreshFriendsData();
    } else {
      message.error(result.message);
    }
  };

  // Define table columns with friend status
  const columns: TableProps<User>["columns"] = [
    {
      title: "User",
      dataIndex: "username",
      key: "username",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} className="mr-3" />
          {text}
        </div>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        const status = text || "OFFLINE";
        let color = "default";

        if (status === "ONLINE") color = "green";
        if (status === "OFFLINE") color = "default";

        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => getUserRelationship(record.id),
    },
  ];

  return (
    <div className="p-4 bg-[#181818] min-h-screen">
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => router.push('/main')}
                className="mr-2"
              />
              <span>Users</span>
            </div>
            <Button onClick={handleLogout} danger>
              Logout
            </Button>
          </div>
        }
        loading={!users}
        className="bg-zinc-800 text-white"
      >
        {users && (
          <Table<User>
            columns={columns}
            dataSource={users}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => setSelectedUser(record),
              style: { cursor: "pointer" },
            })}
          />
        )}
      </Card>
      
      {/* User Profile Modal */}
      <Popover
        content={selectedUser && <UserProfileCard 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          sourceContext="usersList" 
        />}
        title="User Profile"
        open={!!selectedUser}
        onOpenChange={(visible) => !visible && setSelectedUser(null)}
        trigger="click"
        placement="right"
      />
    </div>
  );
};

// Wrap with Ant Design App component to provide context to all child components
const Dashboard: React.FC = () => {
  return (
    <App>
      <DashboardContent />
    </App>
  );
};

export default Dashboard;
