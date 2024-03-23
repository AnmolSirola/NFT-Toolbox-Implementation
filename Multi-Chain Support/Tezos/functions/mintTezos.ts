import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import { InMemorySigner } from "@taquito/signer";

const privateKey = "edskRuycScUrc5KqgiWZXWFa4STEAxJSs18ZXLDdfbDGkiwPWne1QjD4TwRzfDqYXgMwVN2dkDYHBVhPZZDxGDNDneAVNErRvv";
const signer = new InMemorySigner(privateKey);

nftToolbox.initTezosContract({
  name: "DemoContract",
  symbol: "DEMO",
  dir: path.join(__dirname, "Contracts"),
  standard: "FA2",
  connection: JSON.parse(
    fs.readFileSync(path.join(__dirname, "connection.json")).toString()
  ),
  deployed: {
    address: "KT1BvYJM1v3kD2MTAWWkEjPwrZ2xRP8ztPNS",
    storage: {
      owner: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
      ledger: {},
      operators: [],
      metadata: {
        "": Buffer.from("tezos-storage:demo").toString("hex"),
      },
    },
  },
});

const demoMintNFT = async () => {
  const address = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
  let bal = await nftToolbox.readTezosContract("balance_of", [{ owner: address, token_id: 0 }]);
  console.log("Balance: ", bal.toString());

  console.log("Minting New Token");
  const tx = await nftToolbox.writeTezosContract("mint", [
    {
      address: address,
      amount: 1,
      token_id: 0,
      token_info: {
        symbol: "DEMO",
        name: "Demo NFT",
        decimals: 0,
        extras: {},
      },
    },
  ]);
  await tx.confirmation();

  bal = await nftToolbox.readTezosContract("balance_of", [{ owner: address, token_id: 0 }]);
  console.log("Balance: ", bal.toString());
};

demoMintNFT();