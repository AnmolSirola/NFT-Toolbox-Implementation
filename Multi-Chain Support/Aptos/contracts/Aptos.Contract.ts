import fs from "fs";
import path from "path";
import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from "aptos";

type networks = "mainnet" | "testnet";

export interface DraftOptions {
  // Common options
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  // Aptos-specific options
  moduleName: string;
  moduleCode: string;
}

export interface DeployConfigs {
  nodeUrl: string;
  network: networks;
  account: AptosAccount;
}

export interface ContractAttributes {
  dir: fs.PathLike;
  name: string;
  connection: DeployConfigs;
  deployed?: {
    address: string;
    moduleName: string;
  };
}

export class Contract {
  dir: fs.PathLike;
  name: string;
  connection: DeployConfigs;
  deployedInstance: { address: string; moduleName: string } | undefined = undefined;

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
      path.join(this.dir.toString(), `${this.name}.move`),
      contractCode,
      { flag: "w" }
    );
  }

  draft(options: DraftOptions): void {
    const contractCode = `
      module ${options.moduleName} {
        ${options.moduleCode}
      }
    `;
    this.print(contractCode);
    console.log(`Contract created : ${this.dir}`);
  }

  async deploy(): Promise<void> {
    const aptosClient = new AptosClient(this.connection.nodeUrl);
    const modulePath = path.join(this.dir.toString(), `${this.name}.move`);
    const moduleHex = fs.readFileSync(modulePath).toString("hex");

    const moveModule = new TxnBuilderTypes.Module(new HexString(moduleHex).toUint8Array());
    const scriptFunctionPayload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
      TxnBuilderTypes.ScriptFunction.natural(
        `${this.connection.account.address()}::${this.name}`,
        "init",
        [],
        [BCS.bcsToBytes(BCS.serializeU64(0))]
      )
    );

    const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
      aptosClient.getAccount(this.connection.account.address()),
      aptosClient.getChainId(),
    ]);

    const rawTxn = new TxnBuilderTypes.RawTransaction(
      TxnBuilderTypes.AccountAddress.fromHex(this.connection.account.address()),
      BigInt(sequenceNumber),
      scriptFunctionPayload,
      1000n,
      1n,
      BigInt(Math.floor(Date.now() / 1000) + 10),
      new TxnBuilderTypes.ChainId(chainId)
    );

    const bcsTxn = AptosClient.generateBCSTransaction(this.connection.account, rawTxn);
    const pendingTxn = await aptosClient.submitSignedBCSTransaction(bcsTxn);
    await aptosClient.waitForTransaction(pendingTxn.hash);

    console.log(`Contract deployed at ${this.connection.account.address()}::${this.name}`);
    this.deployedInstance = {
      address: this.connection.account.address().hex(),
      moduleName: this.name,
    };
  }

  async write(
    functionName: string,
    typeArguments: string[],
    args: any[]
  ): Promise<any> {
    if (!this.deployedInstance) {
      throw new Error("Contract has not been deployed");
    }

    const aptosClient = new AptosClient(this.connection.nodeUrl);
    const scriptFunctionPayload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
      TxnBuilderTypes.ScriptFunction.natural(
        `${this.deployedInstance.address}::${this.deployedInstance.moduleName}`,
        functionName,
        typeArguments,
        args.map((arg) => BCS.bcsSerializeUint64(arg))
      )
    );

    const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
      aptosClient.getAccount(this.connection.account.address()),
      aptosClient.getChainId(),
    ]);

    const rawTxn = new TxnBuilderTypes.RawTransaction(
      TxnBuilderTypes.AccountAddress.fromHex(this.connection.account.address()),
      BigInt(sequenceNumber),
      scriptFunctionPayload,
      1000n,
      1n,
      BigInt(Math.floor(Date.now() / 1000) + 10),
      new TxnBuilderTypes.ChainId(chainId)
    );

    const bcsTxn = AptosClient.generateBCSTransaction(this.connection.account, rawTxn);
    const pendingTxn = await aptosClient.submitSignedBCSTransaction(bcsTxn);
    await aptosClient.waitForTransaction(pendingTxn.hash);

    return pendingTxn.hash;
  }

  async read(resourcePath: string): Promise<any> {
    if (!this.deployedInstance) {
      throw new Error("Contract has not been deployed");
    }

    const aptosClient = new AptosClient(this.connection.nodeUrl);
    const resource = await aptosClient.getAccountResource(
      this.connection.account.address(),
      resourcePath
    );

    return resource.data;
  }
}