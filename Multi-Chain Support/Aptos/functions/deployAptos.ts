/*

import { readFileSync } from "fs";
import { nftToolbox } from "../src/index";
import path from "path";
import { AptosSDK } from "aptos-ts-sdk"; 

nftToolbox.initAptosContract({
    name: "DemoContract",
    symbol: "Demo",
    dir: path.join(__dirname, "Contracts"),
    standard: "Aptos",
    connection: JSON.parse(
        readFileSync(path.join(__dirname, "connection.json")).toString()
    ),
});

AptosSDK.draftContract({
    baseUri: "ipfs://aptos_exampleCID/",
    mintable: true,
    incremental: true,
});

AptosSDK.deployContract();

*/