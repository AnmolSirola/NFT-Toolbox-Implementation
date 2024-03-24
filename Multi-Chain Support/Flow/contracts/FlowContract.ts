import fs from "fs";
import path from "path";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

type networks = "mainnet" | "testnet";

export interface DraftOptions {
  // Common options
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  // Flow-specific options
  storagePath: string;
  publicPath: string;
  initializerArgs: any[];
}

export interface DeployConfigs {
  accessNode: string;
  network: networks;
  account: string;
  privateKey: string;
}

export interface ContractAttributes {
  dir: fs.PathLike;
  name: string;
  connection: DeployConfigs;
  deployed?: {
    address: string;
    contractName: string;
  };
}

export class Contract {
  dir: fs.PathLike;
  name: string;
  connection: DeployConfigs;
  deployedInstance: { address: string; contractName: string } | undefined = undefined;

  constructor(attr: ContractAttributes) {
    this.dir = attr.dir;
    this.name = attr.name;
    this.connection = attr.connection;

    if (attr.deployed) {
      this.deployedInstance = attr.deployed;
    }
  }

  print(contractCode: string): void {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir);
    }
    fs.writeFileSync(
      path.join(this.dir.toString(), `${this.name}.cdc`),
      contractCode,
      { flag: "w" }
    );
  }

  draft(options: DraftOptions): void {
    const contractCode = `
      pub contract ${this.name} {
        ${options.storagePath}: ${options.publicPath}

        init(${options.initializerArgs.map((arg, index) => `arg${index}: ${typeof arg}`).join(", ")}) {
          self.${options.storagePath} = ${options.publicPath}(${options.initializerArgs.map((_, index) => `arg${index}`).join(", ")})
        }
      }
    `;
    this.print(contractCode);
    console.log(`Contract created : ${this.dir}`);
  }

  async deploy(): Promise<void> {
    const authorization = fcl.authorize(this.connection.privateKey);
    const tx = fcl.transaction`
      transaction {
        prepare(acct: AuthAccount) {
          let code = ${fs.readFileSync(path.join(this.dir.toString(), `${this.name}.cdc`), "utf8")}
          acct.contracts.add(name: "${this.name}", code: code.utf8)
        }
      }
    `;

    const response = await fcl.send([
      fcl.args([]),
      fcl.payer(authorization),
      fcl.proposer(authorization),
      fcl.authorizations([authorization]),
      fcl.limit(100),
      tx,
    ]);

    const txId = await fcl.decode(response);
    console.log(`Contract deployed with transaction ID: ${txId}`);

    this.deployedInstance = {
      address: this.connection.account,
      contractName: this.name,
    };
  }

  async write(
    functionName: string,
    args: any[]
  ): Promise<any> {
    if (!this.deployedInstance) {
      throw new Error("Contract has not been deployed");
    }

    const authorization = fcl.authorize(this.connection.privateKey);
    const tx = fcl.transaction`
      import ${this.deployedInstance.contractName} from ${this.deployedInstance.address}

      transaction {
        prepare(acct: AuthAccount) {
          let instance <- ${this.deployedInstance.contractName}.${functionName}(${args.map((arg) => JSON.stringify(arg)).join(", ")})
          acct.save(<-instance, to: /storage/${this.deployedInstance.contractName})
        }
      }
    `;

    const response = await fcl.send([
      fcl.args([]),
      fcl.payer(authorization),
      fcl.proposer(authorization),
      fcl.authorizations([authorization]),
      fcl.limit(100),
      tx,
    ]);

    const txId = await fcl.decode(response);
    return txId;
  }

  async read(
    fieldName: string,
    args: any[] = []
  ): Promise<any> {
    if (!this.deployedInstance) {
      throw new Error("Contract has not been deployed");
    }

    const script = fcl.script`
      import ${this.deployedInstance.contractName} from ${this.deployedInstance.address}

      pub fun main(): ${typeof args[0] || "AnyStruct"} {
        return ${this.deployedInstance.contractName}.${fieldName}(${args.map((arg) => JSON.stringify(arg)).join(", ")})
      }
    `;

    const response = await fcl.send([
      fcl.args([]),
      fcl.script(script),
    ]);

    const value = await fcl.decode(response);
    return value;
  }
}