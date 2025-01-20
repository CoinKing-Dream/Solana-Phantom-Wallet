import {WalletMultiButton} from "@solana/wallet-adapter-react-ui"
import {useConnection, useWallet} from "@solana/wallet-adapter-react"

export default function WalletConnect() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    return (
        <>
            <div>
                <WalletMultiButton></WalletMultiButton>
            </div>
        </>
    )
}