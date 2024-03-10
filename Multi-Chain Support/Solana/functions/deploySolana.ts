import { readFileSync } from "fs";
import path from "path";
import { nftToolbox } from "../src/index";
import { PublicKey, Keypair } from "@solana/web3.js";

const payer = Keypair.fromSecretKey(Buffer.from("0x7304Cf13eEE8c8C20C6569E2024fB9079184F430", "hex"));
const programData = Buffer.from("GaTJYGhopJDKYgWtjoaz2Gyc2sfRmW9v5haqppdtVxx5", "hex");

nftToolbox.initSolanaContract({
	name: "DemoContract",
	symbol: "DEMO",
	dir: path.join(__dirname, "Contracts"),
	connection: JSON.parse(
		readFileSync(path.join(__dirname, "connection.json")).toString()
	),
});

nftToolbox.draftSolanaContract({
	payer: payer,
    programId: "GaTJYGhopJDKYgWtjoaz2Gyc2sfRmW9v5haqppdtVxx5",
    programData: programData,
});

nftToolbox.deploySolanaContract();
