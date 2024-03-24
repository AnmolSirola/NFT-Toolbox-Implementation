import { readFileSync } from "fs";
import path from "path";
import { nftToolbox } from "../src/index";
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const account = JSON.parse(
  readFileSync(path.join(__dirname, "account.json")).toString()
);

const privateKey = "0x7304Cf13eEE8c8C20C6569E2024fB9079184F430";
const flowAccount = fcl.account(privateKey);

fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
});

nftToolbox.initFlowCollection({
  name: "Demo Collection - Flow",
  dir: path.join(__dirname, "Demo Collection - Flow"),
  description: "This is a demo collection for NFT Toolbox",
  account: flowAccount,
});

const uploadCollectionExample = async function () {
  const res = await nftToolbox.uploadFlowCollectionNFT();
  console.log(res);
};

const demoSingleNftImage = path.resolve(
  __dirname,
  "layers",
  "background",
  "white.png"
);

const demoSingleNftMetadata = {
  name: "Demo Single NFT",
  description: "This is a single demo NFT",
  image: "",
  attributes: [
    { trait_type: "color", value: "grey" },
    { trait_type: "rarity", value: "1" },
  ],
};

const uploadSingleExample = async function () {
  const res = await nftToolbox.uploadSingleNFT(
    demoSingleNftImage,
    demoSingleNftMetadata
  );
  console.log(res);
};

//////////////////////// Select ONE File Storage Platform ////////////////////////
nftToolbox.initFileStorageService({
  service: "pinata",
  key: account.PINATA_KEY,
  secret: account.PINATA_SECURITY,
});

// nftToolbox.initFileStorageService({
//   service: "nft.storage",
//   key: account.NFT_STORAGE_KEY,
// });

// nftToolbox.initFileStorageService({
//   service: "storj",
//   username: account.STORJ_USERNAME,
//   password: account.STORJ_PASSWORD,
// });

// nftToolbox.initFileStorageService({
//   service: "arweave",
//   currency: account.ARWEAVE_CURRENCY,
//   wallet: account.ARWEAVE_WALLET,
// });

// nftToolbox.initFileStorageService({
//   service: "infura",
//   username: account.INFURA_USERNAME,
//   password: account.INFURA_PASSWORD,
// });
//////////////////////////////////////////////////////////////////////////////////

uploadCollectionExample();
uploadSingleExample();