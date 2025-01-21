'use client'

import { solBalance } from "@/app/store";
import { useAtom } from "jotai";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { sendingToken } from "@/app/anchor/tokencontract";

const action = () => {
    const [balance, ] = useAtom(solBalance);
    const {connection} = useConnection();
    const wallet = useAnchorWallet();
    
    const sendTokenClick = async () => {
        if (!wallet || !connection) {
            console.error("Invalid");
            return;
        }
        const result = sendingToken(connection, wallet);
        console.log(result);
    }

    return (
        <>
            <div className="flex flex-col text-black">
                <div>Balance: {balance}</div>
                <div onClick={sendTokenClick} className="py-[20px] px-[100px] bg-gray-800 text-white text-[20px] hover:bg-gray-500 cursor-pointer rounded-md">
                    Send Token
                </div>
            </div>
        </>
    )
}

export default action;