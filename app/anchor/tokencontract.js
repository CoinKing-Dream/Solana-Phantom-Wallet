import * as anchor from "@coral-xyz/anchor"
import { BN, Program } from "@coral-xyz/anchor"
import { PublicKey, Transaction, ComputeBudgetProgram, TransactionMessage } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import IDL from "@/app/anchor/idl.json";
import { program } from "@coral-xyz/anchor/dist/cjs/native/system";

const createProvider = (connection, wallet) => {
    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed"
    });
    anchor.setProvider(provider);
    return provider;
}

const createTransaction = () => {
    const transaction =  new Transaction();
    transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({
            units: 200000
        })
    );
    return transaction;
}

export async function sendingToken(connection, wallet) {
    programID = new PublicKey("4jcbcXzbNT4c6x3tKCxssE58K8kEJhJ49VCGu7w1WQ7V");
    MINT_ADDRESS = new PublicKey("LSRwSDk1hijTNX556ttyY2Nw8xr27F8WkupeD9VZ1rG");
    const USER_ADDRESS = new PublicKey("7zPie5sMcSuQb1fNaPk2aMbY7cmpkgEfKxL8AM449g3p");
    const SEND_AMOUNT = 1000000;

    const mintInfo = await connection.getAccountInfo(MINT_ADDRESS);
    if (!mintInfo) {
        throw new Error('Invalid Mint Address');
    }
    
    if (!IDL || !IDL.metadata || !IDL.metadata.address) {
        throw new Error("Invalid IDL");
    }
    const standardProgram = TOKEN_2022_PROGRAM_ID;
    const provider = createProvider(connection, wallet);
    const transition = createTransaction();

    const senderATA = getAssociatedTokenAddressSync(MINT_ADDRESS, wallet.publicKey, false, standardProgram);
    const senderATAInstruction = createAssociatedTokenAccountInstruction(
        wallet.publicKey, senderATA, wallet.publicKey, MINT_ADDRESS, standardProgram
    );
    transition.add(senderATAInstruction);

    const recipientATA = getAssociatedTokenAddressSync(MINT_ADDRESS, USER_ADDRESS, false, standardProgram);
    const recipientATAInstruction = createAssociatedTokenAccountInstruction(
        wallet.publicKey, recipientATA, USER_ADDRESS, MINT_ADDRESS, standardProgram
    );
    transition.add(recipientATAInstruction);

    const mint = await connection.getTokenSupply(MINT_ADDRESS);
    const decimals = mint.value.decimals;
    const multiplier = new BN(10).pow(decimals);
    const amount = new BN(SEND_AMOUNT) * multiplier;

    transition.add(
        await program.methods.sendToken(amount).accounts({
            from: senderATA,
            authority: wallet.publicKey,
            mint: MINT_ADDRESS,
            recipient: recipientATA,
            tokenProgram: standardProgram
        }).instruction()
    )

    return await provider.sendAndConfirm(transition);
}