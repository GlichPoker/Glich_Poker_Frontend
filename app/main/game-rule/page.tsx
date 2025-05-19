"use client";
import "@ant-design/v5-patch-for-react-19";
import React, { useEffect, useState } from "react";
import { Button, Typography, message, Divider, Tabs } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

const tabList = [
    { key: "standard", label: "Standard Rules" },
    { key: "custom", label: "Custom Rules" },
    { key: "weather", label: "Weather-Based Special Rules" },
];

const GameRule: React.FC = () => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [activeTabKey, setActiveTabKey] = useState<string>("standard");
    const { Title, Paragraph } = Typography;
    const tabItems = [
        {
            key: "standard",
            label: "Standard Rules",
        },
        {
            key: "custom",
            label: "Custom Rules",
        },
        {
            key: "weather",
            label: "Weather-Based Special Rules",
        },
    ];

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Please log in first.");
            router.replace("/login");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (isAuthorized === null) return null;

    const contentList: Record<string, React.ReactNode> = {
        standard: (
            <div className="text-gray-300 space-y-6">
                <Paragraph>
                    The goal of poker is to win chips by either having the best hand at showdown or by convincing other players to fold.
                </Paragraph>
                <div>
                    <Title level={5} className="!text-white">Poker Hand Rankings (Highest to Lowest)</Title>
                    <ul className="list-decimal pl-5 !ml-10">
                        <li>Royal Flush: A, K, Q, J, 10, all of the same suit.</li>
                        <li>Straight Flush: Five consecutive cards of the same suit.</li>
                        <li>Four of a Kind: Four cards of the same rank.</li>
                        <li>Full House: Three of a kind plus a pair.</li>
                        <li>Flush: Five cards of the same suit, not in sequence.</li>
                        <li>Straight: Five consecutive cards of any suit.</li>
                        <li>Three of a Kind: Three cards of the same rank.</li>
                        <li>Two Pair: Two pairs of cards of the same rank.</li>
                        <li>One Pair: Two cards of the same rank.</li>
                        <li>High Card: If no hand qualifies, highest card wins.</li>
                    </ul>
                </div>
                <Divider />
                <div>
                    <Title level={5} className="!text-white !mt-5">Game Phases</Title>
                    <ol className="list-decimal pl-5 space-y-2 !ml-10">
                        <li>
                            <b>Deal:</b> Each player receives two hole cards.
                        </li>
                        <li>
                            <b>Betting Rounds:</b>
                            <ul className="list-disc pl-5 mt-1 !ml-5">
                                <li>Pre-flop</li>
                                <li>Flop</li>
                                <li>Turn</li>
                                <li>River</li>
                            </ul>
                        </li>
                        <li>
                            <b>Showdown:</b> Remaining players reveal hands to determine the winner.
                        </li>
                    </ol >
                </div >
                <Divider />
                <div>
                    <Title level={5} className="!text-white">Betting Options</Title>
                    <ul className="list-decimal pl-5 !ml-10">
                        <li>Check – No bet, pass to next player.</li>
                        <li>Bet – Put chips into the pot.</li>
                        <li>Call – Match a current bet.</li>
                        <li>Raise – Increase the bet amount.</li>
                        <li>Fold – Forfeit your hand.</li>
                    </ul>
                </div>
            </div >
        ),
        custom: (
            <div className="text-gray-300 space-y-6">
                <Paragraph className="text-sm text-gray-400">
                    Custom rules are configured when you <b>create a lobby</b>.
                </Paragraph>

                <div>
                    <Title level={5} className="!text-white">Winner Rule</Title>
                    <ul className="list-disc pl-5 !ml-5">
                        <li><b>High Card Wins:</b> Traditional rule – highest hand wins.</li>
                        <li><b>Low Card Wins:</b> Lowest ranked hand wins (e.g. 7-5-4-3-2 beats 9-8-6-5-4).</li>
                    </ul>
                </div>
                <div>
                    <Title level={5} className="!text-white !mt-5">Hand Rank Type</Title>
                    <ul className="list-disc pl-5 !ml-5">
                        <li><b>Default:</b> Uses standard hand ranking.</li>
                        <li><b>Reverse:</b> Low-value hands beat higher ones.</li>
                        <li><b>Custom:</b> Host defines custom hand ranking order.</li>
                    </ul>
                </div>
            </div>
        ),
        weather: (
            <div className="text-gray-300 space-y-6">
                <Paragraph>Special rules are initially determined based on the <b>lobby host's location</b>.
                    Before the game starts, players can <b>vote</b> to change the weather (and the rule).</Paragraph>
                <ul className="list-disc pl-5 !ml-5">
                    <li><b>SUNNY:</b> Bluff once every round; big blind increases by 5% every third round.</li>
                    <li><b>RAINY:</b> Exchange one card from your hand once per round.</li>
                    <li><b>SNOWY:</b> Receive 3 hole cards instead of 2.</li>
                    <li><b>CLOUDY:</b> Two community cards remain hidden until showdown.</li>
                    <li><b>DEFAULT:</b> No weather rule is applied.</li>
                </ul>
            </div>
        ),
    };

    return (
        <div className="min-h-screen bg-[#181818] text-white px-4 py-10 flex justify-center">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <Title level={2} className="!text-red-800">Glitch Poker Game Rules</Title>
                    <Button type="primary" onClick={() => router.push("/main")}>
                        Back to Main Page
                    </Button>
                </div>

                <Tabs
                    activeKey={activeTabKey}
                    onChange={setActiveTabKey}
                    type="line"
                    tabBarGutter={32}
                    className="
    [&_.ant-tabs-tab]:text-white 
    [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-white 
    [&_.ant-tabs-ink-bar]:!bg-[#9f0712]
  "
                >
                    {tabItems.map((tab) => (
                        <Tabs.TabPane tab={tab.label} key={tab.key}>
                            {contentList[tab.key]}
                        </Tabs.TabPane>
                    ))}
                </Tabs>
            </div>
        </div>
    );
};

export default GameRule;