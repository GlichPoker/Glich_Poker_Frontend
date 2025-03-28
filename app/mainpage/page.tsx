"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout, Button, Dropdown, Avatar, Space, Modal, message } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined, PlusOutlined, TrophyOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import useLocalStorage from "@/hooks/useLocalStorage";
import GlobalLeaderboard from "@/leaderboard/globalLeaderboard";
import FriendLeaderboard from "@/leaderboard/friendLeaderboard"; // Add this import
import { User } from "@/types/user";

const { Header, Content, Footer } = Layout;

const MainPage: React.FC = () => {
  const router = useRouter();
  const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
  const [user, setUser] = useState<User | null>(null);
  const [isCreateLobbyModalVisible, setIsCreateLobbyModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'global' | 'friends'>('global');

 // Check authentication status
  useEffect(() => {
    try {
      // Check for token in both state and localStorage as a fallback
      const localStorageToken = localStorage.getItem("token");
      
      if (!token && !localStorageToken) {
        router.push("/");
        return;
      }
      
      // Get user data from localStorage or API
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString) as User;
          setUser(userData);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          message.error("Error loading user data");
          // Consider clearing invalid data and redirecting user
          clearToken();
          localStorage.removeItem("user");
          router.push("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, router]);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("user");
    message.success("Logged out successfully");
    router.push("/");
  };

  // Define menu items directly
  const menuItems = [
    {
      key: "1",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => router.push("/settings"),
    },
    {
      key: "2",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-800">
      {/* Sticky Header */}
      <Header className="fixed w-full z-10 flex items-center justify-between bg-gray-900 shadow-md px-4">
        {/* Left side - Logo/Title */}
        <div className="text-white text-xl font-bold">GLICH POKER</div>
        
        {/* Right side - User avatar with dropdown */}
        <div>
          <Dropdown 
            menu={{ 
              items: menuItems,
              theme: "dark" 
            }} 
            trigger={["click"]} 
            placement="bottomRight"
          >
            <Space className="cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar size="large" icon={<UserOutlined />} />
              <span className="text-white hidden sm:inline">{user?.username || "User"}</span>
            </Space>
          </Dropdown>
        </div>
      </Header>

      {/* Main Content */}
      <Content className="pt-16 px-4 pb-4">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 mt-8">
          {/* Play Section */}
          <div className="flex flex-col items-center gap-4 my-8">
            <Button 
              type="primary" 
              size="large" 
              className="h-16 w-60 text-xl"
              onClick={() => router.push("/lobbylist")} // TODO: We need to implement the lobby list page as overlay or as seperate page.
            >
              Join Lobby
            </Button>
            
            <Button 
              type="default" 
              icon={<PlusOutlined />}
              onClick={() => setIsCreateLobbyModalVisible(true)}
            >
              Create Lobby
            </Button>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrophyOutlined className="text-yellow-500 mr-2 text-xl" />
                <h2 className="text-xl font-bold text-white">
                  {activeLeaderboard === 'global' ? 'Global Leaderboard' : 'Friends Leaderboard'}
                </h2>
              </div>
              <div className="flex space-x-2">
                <Button 
                  type={activeLeaderboard === 'global' ? 'primary' : 'default'}
                  onClick={() => setActiveLeaderboard('global')}
                >
                  Global
                </Button>
                <Button 
                  type={activeLeaderboard === 'friends' ? 'primary' : 'default'}
                  onClick={() => setActiveLeaderboard('friends')}
                >
                  Friends
                </Button>
              </div>
            </div>
            {activeLeaderboard === 'global' ? (
              <GlobalLeaderboard />
            ) : (
              <FriendLeaderboard />
            )}
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer className="text-center bg-gray-900 text-gray-400">
        <div 
          className="cursor-pointer hover:text-white transition-colors"
          onClick={() => router.push("/about")}
        >
          About GLICH POKER
        </div>
      </Footer>

      {/* Create Lobby Modal */}
      <Modal
        title="Create a New Lobby"
        open={isCreateLobbyModalVisible}
        onCancel={() => setIsCreateLobbyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCreateLobbyModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="create" type="primary" onClick={() => {
            // Implement create lobby functionality here
            setIsCreateLobbyModalVisible(false);
            message.success("Lobby created");
            // Navigate to the lobby or show lobby details
          }}>
            Create
          </Button>
        ]}
      >
        {/* Modal content goes here */}
        <p>Configure your new lobby settings here</p>
        {/* Add form elements for lobby configuration */}
      </Modal>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white">Loading...</div>
        </div>
      )}
    </Layout>
  );
};

export default MainPage;