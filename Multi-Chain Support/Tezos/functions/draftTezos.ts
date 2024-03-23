import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

const secretKey = "edskRuycScUrc5KqgiWZXWFa4STEAxJSs18ZXLDdfbDGkiwPWne1QjD4TwRzfDqYXgMwVN2dkDYHBVhPZZDxGDNDneAVNErRvv";
const signer = new InMemorySigner(secretKey);

nftToolbox.initTezosContract({
  name: "DemoContract",
  symbol: "DEMO",
  dir: path.join(__dirname, "Contracts"),
  standard: "FA2",
  connection: JSON.parse(
    fs.readFileSync(path.join(__dirname, "connection.json")).toString()
  ),
});

nftToolbox.draftTezosContract({
  signer: signer,
  storage: {
    owner: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
    ledger: {},
    operators: [],
    metadata: {
      "": Buffer.from("tezos-storage:demo").toString("hex"),
    },
  },
});