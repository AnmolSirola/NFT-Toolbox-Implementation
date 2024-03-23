import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

const privateKey = "0x7304Cf13eEE8c8C20C6569E2024fB9079184F430";
const account = fcl.account(privateKey);

fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
});

nftToolbox.initFlowContract({
  name: "DemoContract",
  symbol: "DEMO",
  dir: path.join(__dirname, "Contracts"),
  connection: JSON.parse(
    fs.readFileSync(path.join(__dirname, "connection.json")).toString()
  ),
});

nftToolbox.draftFlowContract({
  account: account,
  baseUri: "ipfs://exampleCID/",
  mintable: true,
  incremental: true,
});