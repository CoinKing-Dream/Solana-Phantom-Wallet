'use client'

import { useState, useEffect } from 'react'
import { Connection, PublicKey } from '@solana/web3.js';

type PhantomEvent = "disconnect" | "connect" | "accountChanged"

interface PhantomProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on: (event: PhantomEvent, callback: () => void) => void
  isPhantom: boolean
}

type WindowWithSolana = Window & {
  solana?: PhantomProvider
}

const WalletConnection = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<PhantomProvider | null>(null);
  const [solBalance, setSolBalance] = useState<any>(0);

  useEffect(() => {
    if ("solana" in window) {
      const solWindow = window as WindowWithSolana
      if (solWindow?.solana?.isPhantom) {
        setProvider(solWindow.solana)
        solWindow.solana.on("connect", () => {
          if (solWindow.solana) {
            setWalletAddress(solWindow.solana.publicKey.toString())
          }
        })
        solWindow.solana.on("disconnect", () => {
          setWalletAddress(null)
        })
      }
    }
  }, [])

  const fetchBalance = async (publicKey: string) => {
    try {
      const connection = new Connection("https://api.devnet.solana.com")
      const balance = await connection.getBalance(new PublicKey(publicKey));
      setSolBalance(balance / 1e9); // Convert lamports to SOL
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  }


  const connectWallet = async () => {
    if (provider) {
      try {
        const { publicKey } = await provider.connect();
        setWalletAddress(publicKey.toString());
        fetchBalance(publicKey.toString());
      } catch (err) {
        console.error("Failed to connect wallet", err);
      }
    }
  }

  const disconnectWallet = async () => {
    if (provider) {
      try {
        await provider.disconnect()
        setWalletAddress(null)
      } catch (err) {
        console.error("Failed to disconnect wallet", err)
      }
    }
  }

  if (!provider) {
    return (
      <div className="text-center">
        <p className="mb-4">No provider found. Install Phantom Browser extension</p>
        <button
          onClick={() => window.open("https://phantom.app/", "_blank")}
        >
          Get Phantom
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      {walletAddress ? (
        <div>
          <p className="mb-4">Connected: {walletAddress}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect to Phantom Wallet</button>
      )}
      <div>Wallet Balance: {solBalance}</div>
    </div>
  )
}

export default WalletConnection

