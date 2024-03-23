import { readFileSync } from "fs";
import path from "path";
import { nftToolbox } from "../src/index";
import { AptosAccount, AptosClient, FaucetClient, HexString } from "aptos";

const privateKey = new HexString("0x7304Cf13eEE8c8C20C6569E2024fB9079184F430");
const account = new AptosAccount(privateKey.toUint8Array());

const client = new AptosClient("https://fullnode.devnet.aptoslabs.com/v1");
const faucetClient = new FaucetClient("https://faucet.devnet.aptoslabs.com", client);

nftToolbox.initAptosContract({
  name: "DemoContract",
  symbol: "DEMO",
  dir: path.join(__dirname, "Contracts"),
  connection: JSON.parse(
    readFileSync(path.join(__dirname, "connection.json")).toString()
  ),
});

nftToolbox.draftAptosContract({
  account: account,
  baseUri: "ipfs://exampleCID/",
  mintable: true,
  incremental: true,
});

nftToolbox.deployAptosContract();