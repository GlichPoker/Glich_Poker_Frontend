"use client";
import "@ant-design/v5-patch-for-react-19";
import React, { useEffect, useState } from "react";
import { Button, Divider, message } from "antd";
import { useRouter } from "next/navigation";

const GameRule: React.FC = () => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Please log in first.");
            router.replace("/login");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (isAuthorized === null) {

        return null;
    }

    return (
        <div className="w-screen h-screen flex justify-center bg-[#181818] overflow-auto">
            <div className="w-[90%] h-dvh">

                {/* title and back to main button */}
                <section>
                    <div className="h-20 flex justify-between items-center">
                        <h1 className="text-red-800 text-3xl font-bold">Glitch Poker Game Rules</h1>
                        <Button type="primary" onClick={() => router.push("/main")}>Back to Main Page</Button>
                    </div>
                </section>

                {/* poker game rules */}
                <section className="!mt-10">
                    <p className=" text-gray-400">
                        The goal of poker is to win chips by either having the best hand at
                        showdown or by convincing other players to fold their hands.
                    </p>
                </section>
                <Divider className="!border-red-900 font-bold">Poker Hand Rankings (From Highest to Lowest)</Divider>
                <section>
                    <ul className="text-gray-400">
                        <li>1. Royal Flush: A, K, Q, J, 10, all of the same suit.</li>
                        <li>2. Straight Flush: Five consecutive cards of the same suit.</li>
                        <li>3. Four of a Kind: Four cards of the same rank.</li>
                        <li>4. Full House: Three of a kind plus a pair.</li>
                        <li>5. Flush: Five cards of the same suit, not in sequence.</li>
                        <li>6. Straight: Five consecutive cards of any suit.</li>
                        <li>7. Three of a Kind: Three cards of the same rank.</li>
                        <li>8. Two Pair: Two pairs of cards of the same rank.</li>
                        <li>9. One Pair: Two cards of the same rank.</li>
                        <li>10. High Card: If no one has a hand above, the highest card wins.</li>
                    </ul>
                </section>
                <Divider className="!border-red-900 font-bold">Game Phrases</Divider>
                <section className="text-gray-400">
                    <p>
                        1. <b>The Deal</b>: Each player is dealt two private cards (also known as hole cards).
                    </p>
                    <p>
                        2. <b>The Betting Rounds</b>: There are four betting rounds:
                    </p>
                    <ul className="!pl-8 list-disc">
                        <li>Pre-flop: After hole cards are dealt.</li>
                        <li>The Flop: Three community cards are dealt face-up.</li>
                        <li>The Turn: A fourth community card is dealt.</li>
                        <li>The River: A fifth community card is dealt.</li>
                    </ul>
                    <p>
                        3. <b>Showdown</b>: If more than one player remains after the final round of betting, the hands are revealed, and the best hand wins.
                    </p>
                </section>
                <Divider className="!border-red-900 font-bold">Betting Options</Divider>
                <section>
                    <ul className="list-decimal !pl-4 text-gray-400">
                        <li>Check: Passing the action to the next player without betting.</li>
                        <li>Bet: Putting chips into the pot.</li>
                        <li>Call: Matching the current bet.</li>
                        <li>Raise: Increasing the bet.</li>
                        <li>Fold: Discarding the hand and forfeiting the round.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default GameRule;