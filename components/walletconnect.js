import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAtom } from "jotai";
import { solBalance } from "@/app/store";

export default function WalletConnect() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [solanaBalance, setSolanaBalance] = useAtom(solBalance);

    useEffect(() => {
        if (!publicKey) return;
        connection.getBalance(publicKey).then(balance => {
            setSolanaBalance(balance / LAMPORTS_PER_SOL);
        });
    }, [publicKey, connection]);
    
    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <WalletMultiButton
                    style={{
                        backgroundColor: '#2F46E5',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out',
                    }} />
                <div>
                    {solanaBalance}
                </div>
            </div>
        </>
    )
}