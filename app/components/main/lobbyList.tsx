"use client";
import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";

const { Meta } = Card;

const imgList = [
    { id: "1", weather: "sunny", src: "/images/lobby/sunny.jpg" },
    { id: "2", weather: "rain", src: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" },
    { id: "3", weather: "snow", src: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" },
    { id: "4", weather: "windy", src: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" },
    { id: "5", weather: "cloudy", src: "/images/lobby/cloudy.jpg" }
];

// Todo: need to revise after applying weather API
const getRandomImage = () => {
    const randomId = Math.floor(Math.random() * 5) + 1; // create 1~5 number 
    return imgList.find((img) => img.id === randomId.toString())?.src;
};

const LobbyList = () => {
    const router = useRouter();
    const [lobbies, setLobbies] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchLobbies = async () => {
            setLoading(true);
            try {

                const response = await axios.get('http://localhost:8080/allGames');
                setLobbies(response.data);
            } catch (error) {
                message.error('Failed to load lobbies');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchLobbies();
    }, []);
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#181818]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-full bg-[#181818] p-4">
            <div className="flex flex-wrap gap-4 bg-[#181818]">
                {lobbies.map((lobby) => {
                    const randomImage = getRandomImage();

                    return (
                        <Card
                            key={lobby.id}
                            className="w-[300px] overflow-hidden rounded-lg"
                            cover={
                                <img
                                    alt="lobby cover"
                                    src={randomImage}
                                    className="w-full h-[200px] object-cover"
                                />
                            }
                            actions={[
                                <div key="join" className="w-full flex justify-center bg-[#181818]">
                                    <Button type="primary" onClick={() => router.push(`/lobby/${lobby.id}`)}>Join</Button>
                                </div>
                            ]}
                        >
                            <Meta
                                title={<span className="text-white">{lobby.title}</span>}
                                description={<span className="text-white">{lobby.description}</span>}
                            />
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default LobbyList;