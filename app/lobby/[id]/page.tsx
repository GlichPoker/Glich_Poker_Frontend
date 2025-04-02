"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { message, Button } from "antd";
import "@ant-design/v5-patch-for-react-19";

const LobbyPage = () => {
    const params = useParams();
    const router = useRouter();
    const lobbyId = params.id;
    const messageDisplayed = useRef(false);

    // Use a ref to track if message has been shown
    useEffect(() => {
        if (lobbyId && !messageDisplayed.current) {
            message.success(`You entered lobby ${lobbyId}!`);
            messageDisplayed.current = true;
        }
    }, [lobbyId]);

    return (
        <div className="flex flex-col w-full h-auto">
            {/* nav bar - exit button*/}
            <nav className="flex flex-row h-14 justify-between items-center bg-[#181818]">
                <div className="flex flex-row justify-end w-[95%] h-[40px] ">
                    <Button type="link" className="!text-gray-500 !font-bold" onClick={() => router.push("/main")}>Exit</Button>
                </div>
            </nav>
            <div className="bg-[url('/images/poker-table.jpg')] bg-cover bg-center relative">
                <div className="flex flex-row w-full h-auto">
                    {/* left - other player 1,2 */}
                    <div className="flex flex-col items-center w-[33.33%]">
                        <section className="text-white h-45">player1</section>
                        <section className="text-white h-45">player2</section>
                    </div>


                    {/* center - board */}
                    <div className="flex flex-col items-center w-[33.33%] bg-blue-300">
                        <section>board</section>
                    </div>

                    {/* right - other player 3,4 */}
                    <div className="flex flex-col items-center w-[33.33%]">
                        <section className="text-white h-45">player3</section>
                        <section className="text-white h-45">player4</section>
                    </div>
                </div>
                {/* my play */}
                <div className="flex flex-row w-full h-70 bg-blue-500">
                    logged-in player
                </div>
                {/* my play */}
                <div className="flex flex-row w-full h-auto justify-evenly ">
                    <Button type="primary" className="w-[120px] !font-bold">Check</Button>
                    <Button type="primary" className="w-[120px] !font-bold">Bet</Button>
                    <Button type="primary" className="w-[120px] !font-bold">Call</Button>
                    <Button type="primary" className="w-[120px] !font-bold">Raise</Button>
                    <Button type="primary" className="w-[120px] !font-bold">Fold</Button>

                </div>

            </div>
        </div>

    );
};

export default LobbyPage;