"use client";
import React from "react";
import { Card, Button } from "antd";
import { useRouter } from "next/navigation";

const { Meta } = Card;

const dummyLobbies = [
    { id: "1", title: "lobby name 1", description: "custom rule 1" },
    { id: "2", title: "lobby name 2", description: "custom rule 2" },
    { id: "3", title: "lobby name 3", description: "custom rule 3" },

];

const imgList = [
    { id: "1", weather: "sunny", src: "/images/lobby/sunny.jpg" },
    { id: "2", weather: "rain", src: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" },
    { id: "3", weather: "snow", src: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" },
    { id: "4", weather: "windy", src: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" },
    { id: "5", weather: "cloudy", src: "/images/lobby/cloudy.jpg" }
];

// Todo: need to revised after applying weather API
const getRandomImage = () => {
    const randomId = Math.floor(Math.random() * 5) + 1; // create 1~5 number 
    return imgList.find((img) => img.id === randomId.toString())?.src;
};


const LobbyList = () => {
    const router = useRouter();

    return (
        <div className="w-full min-h-full bg-[#181818] p-4">
            <div className="flex flex-wrap gap-4 bg-[#181818]">
                {dummyLobbies.map((lobby) => {
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
                                    <Button type="primary" key="join" onClick={() => router.push(`/lobby/${lobby.id}`)}>Join</Button>
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