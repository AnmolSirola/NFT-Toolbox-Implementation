import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import { Keypair } from "@solana/web3.js";

const payer = Keypair.fromSecretKey(Buffer.from("0x7304Cf13eEE8c8C20C6569E2024fB9079184F430", "hex"));
const programId = new PublicKey("GaTJYGhopJDKYgWtjoaz2Gyc2sfRmW9v5haqppdtVxx5");

nftToolbox.initSolanaContract({
  name: "DemoContract",
  symbol: "DEMO",
  dir: path.join(__dirname, "Contracts"),
  connection: JSON.parse(fs.readFileSync(path.join(__dirname, "connection.json")).toString()),
  deployed: {
    programId: programId,
  },
});

const demoMintNFT = async () => {
  const address = "your_solana_wallet_address";

  let bal = await nftToolbox.readSolanaContract("balanceOf", [address]);
  console.log("Balance: ", bal.toString());

  console.log("Minting New Token");
  const tx = await nftToolbox.writeSolanaContract("safeMint", [address]);
  await tx.confirmation("confirmed");

  bal = await nftToolbox.readSolanaContract("balanceOf", [address]);
  console.log("Balance: ", bal.toString());
};

demoMintNFT();
