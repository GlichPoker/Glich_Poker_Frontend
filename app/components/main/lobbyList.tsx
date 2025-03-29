"use client";
import React from "react";
import { Card, Button } from "antd";

const { Meta } = Card;

const dummyLobbies = [
    { id: "1", title: "lobby name 1", description: "custom rule 1" },
    { id: "2", title: "lobby name 2", description: "custom rule 2" },
    { id: "3", title: "lobby name 3", description: "custom rule 3" },
];

const imgList = [
    { id: "1", weather: "sunny", src: "/images/sunny.jpg" },
    { id: "2", weather: "rain", src: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" },
    { id: "3", weather: "snow", src: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" },
    { id: "4", weather: "windy", src: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" },
    { id: "5", weather: "cloudy", src: "/images/cloudy.jpg" }
];

const getRandomImage = () => {
    const randomId = Math.floor(Math.random() * 5) + 1; // create 1~5 number 
    return imgList.find((img) => img.id === randomId.toString())?.src;
};

const LobbyList: React.FC = () => {
    return (
        <div className="w-full p-4" style={{ backgroundColor: '#181818' }}>
            <div className="flex flex-wrap gap-4">
                {dummyLobbies.map((lobby) => {
                    const randomImage = getRandomImage(); // 각 로비마다 랜덤 이미지 가져오기

                    return (
                        <Card
                            key={lobby.id}
                            style={{ width: 300 }}
                            cover={<img alt="lobby cover" src={randomImage} style={{ width: "100%", height: "200px", objectFit: "cover" }} />}
                            actions={[<Button type="primary" key="join">Join</Button>]}
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