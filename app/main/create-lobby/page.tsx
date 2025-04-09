"use client";
import React from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";

//TODO
//make inputs required to make a new lobby: name, private/public
//looby creator automatically join the lobby
//lobby list should be updated

const CreateLobby: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#181818]">
      <h1 className="text-white text-2xl mb-6">Create Lobby Page</h1>
      <p className="text-gray-400 mb-8">This page is under construction</p>
      <Button 
        type="primary" 
        onClick={() => router.push("/main")}
      >
        Back to Main
      </Button>
    </div>
  );
};

export default CreateLobby;