"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { Button, Modal } from "antd";
import React, { useState } from 'react';
import LoginForm from "./login/LoginForm";
import RegisterForm from "./register/RegisterForm";

export default function Home() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showLoginView, setShowLoginView] = useState(true);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setShowLoginView(true); // Reset to login view when modal closes
  };

  const toggleView = () => {
    setShowLoginView(!showLoginView);
  };

  return (
    <div className="relative w-full h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/main.jpg')" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
        <h1 className="text-6xl font-bold text-white">GLICH POKER</h1>
        <p className="text-red-400 italic mt-4">Play with the Devil!</p>
        <Button
          className="max-w-xs main-btn !mt-10"
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
          <LoginForm onSwitchView={toggleView} />
        ) : (
          <RegisterForm onSwitchView={toggleView} />
        )}
      </Modal>
    </div>
  );
}