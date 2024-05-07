// Sample contract code for Tezos. 
// Note: this contract is not complete and is just a template for the contract to be implemented
import fs from "fs";
import path from "path";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { Contract as TezosContract, tzip16 } from "@taquito/taquito";

// Define the supported network types
type networks = "mainnet" | "delphinet" | "edonet" | "florencenet" | "granadanet";

// Define the options for drafting a contract
export interface DraftOptions {
  // Common options
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;

  // Tezos-specific options
  storage: {
    owner?: string;
    ledger?: Record<string, number>;
    operators?: Record<string, Record<string, boolean>>;
    metadata?: Record<string, string>;
  };

  // FA1.2 options
  transferable?: boolean;

  // FA2 options
  supportsNonFungibleTokens?: boolean;
  supportsMultipleTokenTypes?: boolean;
}

// Define the deployment configuration
export interface DeployConfigs {
  rpc: string;
  network: networks;
  signer: InMemorySigner;
}

// Define the contract attributes
export interface ContractAttributes {
  dir: fs.PathLike;
  standard: string;
  name: string;
  connection: DeployConfigs;
  deployed?: {
    address: string;
    storage: object;
  };
}

// Define the Contract class
export class Contract {
  // Contract properties
  dir: fs.PathLike;
  standard: string;
  name: string;
  connection: DeployConfigs;
  deployedInstance: TezosContract | undefined = undefined;

  // Constructor
  constructor(attr: ContractAttributes) {
    this.dir = attr.dir;
    this.standard = attr.standard;
    this.name = attr.name;
    this.connection = attr.connection;
    if (attr.deployed) {
      this.deployedInstance = new TezosContract(attr.deployed.address);
    }
  }

  // Print the contract code to a file
  print(contractCode: string): void {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir);
    }
    fs.writeFileSync(
      path.join(this.dir.toString(), `${this.name}.tz`),
      contractCode,
      { flag: "w" }
    );
  }

  // Draft a contract with the specified options
  draft(options: DraftOptions): void {
    const contractCode = `
      parameter (or (int %increment) (int %decrement));
      storage int;
      code {
        DUP;
        CDR;
        SWAP;
        CAR;
        IF_LEFT {
          ADD
        } {
          SWAP;
          SUB;
          SWAP
        };
        NIL operation;
        PAIR
      }
    `;
    this.print(contractCode);
    console.log(`Contract created: ${this.dir}`);
  }

  // Deploy the contract
  async deploy(): Promise<void> {
    const tezos = new TezosToolkit(this.connection.rpc);
    tezos.setProvider({ signer: this.connection.signer });
    const { script, storage } = await tezos.contract.originate({
      code: fs.readFileSync(path.join(this.dir.toString(), `${this.name}.tz`), "utf8"),
      init: `${JSON.stringify(0)}`,
    });
    await script.new(storage).send();
    console.log(`Contract originated at ${script.address}`);
    this.deployedInstance = await tezos.contract.at(script.address);
  }

  // Write to the contract
  async write(
    method: string,
    args: object,
    amount: number = 0,
    mutez: boolean = false
  ): Promise<any> {
    if (!this.deployedInstance) {
      throw new Error("Contract has not been deployed");
    }
    const operation = await this.deployedInstance.methods[method](args).send({
      amount: mutez ? amount : amount * 1000000,
      mutez: mutez,
    });
    await operation.confirmation();
    return operation;
  }

  // Read from the contract
  async read(propertyName: string): Promise<any> {
    if (!this.deployedInstance) {
      throw new Error("Contract has not been deployed");
    }
    const storage = await this.deployedInstance.storage();
    return storage[propertyName];
  }
}

/* 
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import fs from 'fs';
import path from 'path';

interface DraftOptions {
  // Tezos-specific options
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
}

interface DeployConfigs {
  rpc: string;
  signer: InMemorySigner;
}

interface ContractAttributes {
  dir: fs.PathLike;
  name: string;
  symbol: string;
  connection: DeployConfigs;
  deployed?: {
    address: string;
    contract: any;
  };
}

export class Contract {
  dir: fs.PathLike;
  name: string;
  symbol: string;

  rpc: string;
  signer: InMemorySigner;
  deployedInstance: any;

  constructor(attr: ContractAttributes) {
    this.dir = attr.dir;
    this.name = attr.name;
    this.symbol = attr.symbol;

    this.rpc = attr.connection.rpc;
    this.signer = attr.connection.signer;
    this.deployedInstance = attr.deployed?.contract;
  }

  print(contractCode: string): void {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir);
    }
    fs.writeFileSync(
      path.join(this.dir.toString(), `${this.name}.tz`),
      contractCode,
      { flag: "w" }
    );
  }



  draft(options: DraftOptions): void {
    const storage = 0;
    const parameter = "int";
    const code = [
      { prim: "parameter", args: [{ prim: parameter }] },
      { prim: "storage", args: [{ prim: "int" }] },
      {
        prim: "code",
        args: [
          [
            { prim: "CAR" },
            { prim: "ADD" },
            { prim: "NIL", args: [{ prim: "operation" }] },
            { prim: "PAIR" },
          ],
        ],
      },
    ];

    const contract = {
      code,
      storage,
    };

    const contractCode = JSON.stringify(contract, null, 2);
    this.print(contractCode);
    console.log(`Contract created: ${this.dir}`);
  }

    async deploy(): Promise<void> { 
        const rpc = "https://api.tez.ie/rpc/florencenet";
        const signer = new InMemorySigner("your_private_key_here");

        const Tezos = new TezosToolkit(rpc);
        Tezos.setProvider({ signer });

        const contractCode = fs.readFileSync(
            path.join(this.dir.toString(), `${this.name}.tz`),
            "utf-8"
        );

        Tezos.wallet
        .originate({
            code: contractCode,
            storage: 0,
        })
        .send()
        .then((operation) => {
            return operation.confirmation().then(() => operation.contract());
            })
        .then((contract) => {
            this.deployedInstance = {
                address: contract.address,
                contract,
            };
            console.log(`Contract deployed at ${this.deployedInstance.address}`);
        })
        .catch((error) => {
            console.error(`Error deploying contract: ${error}`);
        });
    }

  async write(value: number): Promise<string> {
    if (!this.deployedInstance) {
      throw new Error("Contract has not been deployed");
    }

    const Tezos = new TezosToolkit(this.rpc);
    Tezos.setProvider({ signer: this.signer });

    const operation = await this.deployedInstance.contract.methods.main(value).send();
    console.log(`Transaction ${operation.opHash} sent to ${this.deployedInstance.address}`);
    return operation.opHash;
  }

  async read(): Promise<number> {
    if (!this.deployedInstance) {
      throw new Error("Contract has not been deployed");
    }

    const Tezos = new TezosToolkit(this.rpc);
    Tezos.setProvider({ signer: this.signer });

    const storage = await this.deployedInstance.contract.storage();
    return storage.toNumber();
  }
}
*/