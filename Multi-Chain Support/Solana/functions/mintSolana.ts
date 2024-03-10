import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import { Keypair } from "@solana/web3.js";

const payer = Keypair.fromSecretKey(Buffer.from("0x087a9d913769E8355f6d25747012995Bc03b80aD", "hex"));
const programId = new PublicKey("5zyx93d8GMmKrdKLqMykyQAm5EMMy2vC4GZbGnwQkcMX");

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
  const address = "7abc42e5HKiTeaLvNykxZyePXEMy2vC5HXaLeuPkdTA";

  let bal = await nftToolbox.readSolanaContract("balanceOf", [address]);
  console.log("Balance: ", bal.toString());

  console.log("Minting New Token");
  const tx = await nftToolbox.writeSolanaContract("safeMint", [address]);
  await tx.confirmation("confirmed");

  bal = await nftToolbox.readSolanaContract("balanceOf", [address]);
  console.log("Balance: ", bal.toString());
};

demoMintNFT();
