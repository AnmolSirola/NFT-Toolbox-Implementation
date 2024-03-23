import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import { AptosAccount, HexString } from "aptos";

const privateKey = new HexString("0x7304Cf13eEE8c8C20C6569E2024fB9079184F430");
const account = new AptosAccount(privateKey.toUint8Array());

nftToolbox.initAptosContract({
  name: "DemoContract",
  symbol: "DEMO",
  dir: path.join(__dirname, "Contracts"),
  connection: JSON.parse(
    fs.readFileSync(path.join(__dirname, "connection.json")).toString()
  ),
});

nftToolbox.draftAptosContract({
  account: account,
  baseUri: "ipfs://exampleCID/",
  mintable: true,
  incremental: true,
});