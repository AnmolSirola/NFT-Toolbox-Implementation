import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import { Keypair } from "@solana/web3.js";

const payer = Keypair.fromSecretKey(Buffer.from("0x087a9d913769E8355f6d25747012995Bc03b80aD", "hex"));
const programData = Buffer.from("GaTJYGhopJDKYgWtjoaz2Gyc2sfRmW9v5haqppdtVxx5", "hex");

nftToolbox.initSolanaContract({
  name: "DemoContract",
  symbol: "DEMO",
  dir: path.join(__dirname, "Contracts"),
  connection: JSON.parse(fs.readFileSync(path.join(__dirname, "connection.json")).toString()),
});

nftToolbox.draftSolanaContract({
  payer: payer,
  programData: programData,
});

