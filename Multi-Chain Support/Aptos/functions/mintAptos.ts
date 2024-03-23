import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import { AptosAccount, AptosClient, HexString } from "aptos";

const privateKey = new HexString("0x7304Cf13eEE8c8C20C6569E2024fB9079184F430");
const account = new AptosAccount(privateKey.toUint8Array());

const client = new AptosClient("https://fullnode.devnet.aptoslabs.com/v1");

nftToolbox.initAptosContract({
  name: "DemoContract",
  symbol: "DEMO",
  dir: path.join(__dirname, "Contracts"),
  connection: JSON.parse(
    fs.readFileSync(path.join(__dirname, "connection.json")).toString()
  ),
  deployed: {
    address: "0x5009278830fB58551bD518157cBb0002eB5DC80E",
    moduleName: "DemoNFT",
  },
});

const demoMintNFT = async () => {
  const address = "0x7304Cf13eEE8c8C20C6569E2024fB9079184F430";
  let bal = await nftToolbox.readAptosContract("balance", [address]);
  console.log("Balance: ", bal.toString());

  console.log("Minting New Token");
  const tx = await nftToolbox.writeAptosContract("mint", [address]);
  await client.waitForTransaction(tx);

  bal = await nftToolbox.readAptosContract("balance", [address]);
  console.log("Balance: ", bal.toString());
};

demoMintNFT();