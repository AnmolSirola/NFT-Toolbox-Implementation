import path from "path";
import fs from "fs";
import { nftToolbox } from "../src/index";
import { InMemorySigner } from "@taquito/signer";
import { TezosToolkit } from "@taquito/taquito";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const account = JSON.parse(
  fs.readFileSync(path.join(__dirname, "account.json")).toString()
);

nftToolbox.initTezosCollection({
  name: "Demo Collection - Tezos",
  dir: path.join(__dirname, "Demo Collection - Tezos"),
  description: "This is a demo collection for NFT Toolbox on Tezos",
});

const uploadCollectionExample = async function () {
  const res = await nftToolbox.uploadTezosCollectionNFT();
  console.log(res);
};

const demoSingleNftImage = path.resolve(
  __dirname,
  "layers",
  "background",
  "white.png"
);
const demoSingleNftMetadata = {
  name: "Demo Single NFT - Tezos",
  description: "This is a single demo NFT on Tezos",
  image: "",
  attributes: [
    { trait_type: "color", value: "grey" },
    { trait_type: "rarity", value: "1" },
  ],
};

const uploadSingleExample = async function () {
  const res = await nftToolbox.uploadSingleTezosNFT(
    demoSingleNftImage,
    demoSingleNftMetadata
  );
  console.log(res);
};

//////////////////////// Select ONE File Storage Platform ////////////////////////

// nftToolbox.initFileStorageService({
//   service: "pinata",
//   key: account.PINATA_KEY,
//   secret: account.PINATA_SECURITY,
// });

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
