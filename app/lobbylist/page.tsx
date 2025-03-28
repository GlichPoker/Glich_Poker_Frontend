"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { Button, Modal } from "antd";
import React, { useState } from 'react';

export default function Lobbylist() {

    return (
        <h1>This is a lobby list page</h1>
    );
}//TODO: Lobbyoverlay with all the joinable lobbies