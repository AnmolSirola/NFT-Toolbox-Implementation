import fs from "fs";
import path from "path";
import { SystemProgram, Keypair, Connection, Transaction, TransactionInstruction,
   PublicKey, sendAndConfirmTransaction, Commitment} from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import { Program, Idl, Provider } from '@project-serum/anchor';

const wasmFilePath = '../../../../native/target/wasm32-unknown-unknown/debug/native.wasm';

type networks = "devnet" | "testnet" | "mainnet-beta";

export interface DraftOptions {
  // Solana-specific options
  payer: Keypair;
  programId: string;
  programData: Buffer;
}

export interface DeployConfigs {
  rpc: string;
  network: networks;
  connection: Connection;
  payer: Keypair;
  idl: Idl;
}

interface DeployedInstance {
  address: string;
}

export interface ContractAttributes {
  dir: fs.PathLike;
  name: string;
  symbol: string;
  connection: DeployConfigs;
  deployed?: {
    address: string;
    programId: string;
    programData?: Buffer;
  };
}

export class Contract {
  dir: fs.PathLike;
  name: string;
  symbol: string;

  payer: Keypair;
  programId: string;
  programData: Buffer;
  connection: Connection;
  idl: Idl;

  deployedInstance: string | undefined = undefined;
  rpc: string;

  constructor(attr: ContractAttributes) {
    this.dir = attr.dir;
    this.name = attr.name;
    this.symbol = attr.symbol;

    this.connection = attr.connection.connection;
    this.payer = attr.connection.payer;
    this.programId = attr.deployed?.programId || "";
    this.programData = attr.deployed?.programData || Buffer.alloc(0);
    this.deployedInstance = attr.deployed?.address;
    this.rpc = attr.connection.rpc;
    this.idl = attr.connection.idl;
  }

  print(contractCode: string): void {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir);
    }
    fs.writeFileSync(
      path.join(this.dir.toString(), `${this.name}.sol`),
      contractCode,
      { flag: "w" }
    );
  }