import fs from "fs";
import path from "path";
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
});
  

nftToolbox.draftTezosContract({
  baseUri: "ipfs://exampleCID/",
  mintable: true,
  incremental: true,
});

nftToolbox.deployTezosContract();
