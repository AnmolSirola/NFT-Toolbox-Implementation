import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import { InMemorySigner } from "@taquito/signer";
import { TezosToolkit } from "@taquito/taquito";

nftToolbox.initTezosContract({
  name: "DemoContract",
  symbol: "DEMO",
  dir: path.join(__dirname, "Contracts"),
  standard: "TZIP-12",
  connection: JSON.parse(
    fs.readFileSync(path.join(__dirname, "connection.json")).toString()
  ),
  deployed: {
    contractAddress: "tz1XR97BrZbja6M2ND37omV7rBwKUqd8pm7w", // 
    abi: fs.readFileSync(path.join(__dirname, "abi.json")).toString(),
  },
});

const demoMintNFT = async () => {
  const address = "tz1YourWalletAddress";

  let bal = await nftToolbox.readTezosContract("balanceOf", [address]);
  console.log("Balance: ", bal.toString());

  console.log("Minting New Token");
  const tx = await nftToolbox.writeTezosContract("safeMint", [address]);
  await tx.confirmation();

  bal = await nftToolbox.readTezosContract("balanceOf", [address]);
  console.log("Balance: ", bal.toString());
};

demoMintNFT();