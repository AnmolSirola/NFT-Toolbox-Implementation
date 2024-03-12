import fs from "fs";
import path from "path";
import { ethers } from "ethers";

type PropertyMap = Record<string, string>;
type TokenProperties = Record<string, PropertyMap>;

export interface DraftOptions {
    nftOwners?: Record<string, string>;
    ownerToNFTCount?: Record<string, number>;
    nftApprovals?: Record<string, string>;
    nftBalances?: Record<string, number>;
    nftData?: Record<string, string>;
    operatorApprovals?: Record<string, Record<string, boolean>>;
}

export interface DeployConfigs {
    network: networks;
    provider: {
        aptosscan?: string;
        alchemy?: string;
        ankr?: string;
        infura?: {
            projectId: string;
            projectSecret: string;
        };
        pocket?: {
            applicationId: string;
            applicationSecretKey: string;
        };
    };
    wallet: {
        privateKey: string;
    };
}

export interface ContractAttributes {
    dir: fs.PathLike;
    standard: any; // You should define or import DAStandards
    name: string;
    symbol: string;
    connection: DeployConfigs;
    deployed?: {
        address: string;
        abi: string;
    };
}

export class Contract {
    dir: fs.PathLike;
    standard: any; // You should define or import DAStandards

    name: string;
    symbol: string;

    signer: ethers.Signer;
    provider: ethers.providers.Provider;

    deployedInstance: ethers.Contract | undefined = undefined;

    constructor(attr: ContractAttributes) {
        this.dir = attr.dir;
        this.standard = attr.standard;
        this.name = attr.name;
        this.symbol = attr.symbol;

        this.provider = this.getProvider(attr.connection);
        this.signer = new ethers.Wallet(
            attr.connection.wallet.privateKey,
            this.provider
        );

        if (attr.deployed) {
            this.deployedInstance = new ethers.Contract(
                attr.deployed.address,
                attr.deployed.abi,
                this.signer
            );
        }
    }

    getProvider = (config: DeployConfigs): ethers.providers.Provider => {
        const network = ethers.providers.getNetwork(config.network);
        if (Object.keys(config.provider).length != 1) {
            throw new Error(
                `Exactly One Provider is expected, found ${
                    Object.keys(config.provider).length
                }`
            );
        }
        switch (Object.keys(config.provider)[0]) {
            case "aptosscan":
                return new ethers.providers.EtherscanProvider(
                    network,
                    config.provider.aptosscan
                );
            case "alchemy":
                return new ethers.providers.AlchemyProvider(
                    network,
                    config.provider.alchemy
                );
            case "ankr":
                return new ethers.providers.AnkrProvider(
                    network,
                    config.provider.ankr
                );
            case "infura":
                return new ethers.providers.InfuraProvider(
                    network,
                    config.provider.infura
                );
            case "pocket":
                return new ethers.providers.PocketProvider(
                    network,
                    config.provider.pocket
                );
            default:
                throw new Error(
                    `Provider ${Object.keys(config.provider)} not supported`
                );
        }
    };
}

export class AptosContract {
    dir: fs.PathLike;
    name: string;
    symbol: string;
    signer: ethers.Signer;
    provider: ethers.providers.Provider;
    deployedInstance: ethers.Contract | undefined = undefined;

    constructor(dir: fs.PathLike, name: string, symbol: string, signer: ethers.Signer, provider: ethers.providers.Provider) {
        this.dir = dir;
        this.name = name;
        this.symbol = symbol;
        this.signer = signer;
        this.provider = provider;
    }

    // Function to print the contract code to a file
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

    // Function to draft the contract code based on provided options
    draft(options: DraftOptions): void {
        let contractCode: string = `// Define the Aptos contract\n`;
        contractCode += `contract AptosContract {\n\n`;

        // Define struct for token metadata
        contractCode += `\tstruct TokenMetadata {\n`;
        contractCode += `\t\tstring name;\n`;
        contractCode += `\t\tstring description;\n`;
        contractCode += `\t\tstring uri;\n`;
        contractCode += `\t\tPropertyMap properties;\n`;
        contractCode += `\t}\n\n`;

        // Define struct for token
        contractCode += `\tstruct Token {\n`;
        contractCode += `\t\tTokenMetadata metadata;\n`;
        contractCode += `\t\taddress owner;\n`;
        contractCode += `\t}\n\n`;

        // Define struct for collection
        contractCode += `\tstruct Collection {\n`;
        contractCode += `\t\tstring name;\n`;
        contractCode += `\t\tstring description;\n`;
        contractCode += `\t\tstring uri;\n`;
        contractCode += `\t\tuint256 max_supply;\n`;
        contractCode += `\t\tToken[] tokens;\n`;
        contractCode += `\t}\n\n`;

        // Define storage for collections
        contractCode += `\tCollection[] collections;\n\n`;

        // Define functions for contract operations
        // (functions implementation to be added later)

        contractCode += `}\n`;

        // Print the contract code to a file
        this.print(contractCode);
        console.log(`Contract created: ${this.dir}`);
    }

    // Function to compile the contract
    compile(): void {
        // Code for compiling the contract
        console.log(`Compiling ${this.name}.sol`);
    }

    // Function to deploy the contract
    async deploy(): Promise<void> {
        // Code for deploying the contract
        console.log(`Deploying ${this.name}.sol`);
    }

    // Function to write data to the contract
    async write(method: string, args: any[]): Promise<ethers.providers.TransactionResponse> {
        // Code for writing data to the contract
        console.log(`Writing data to ${this.name} contract`);
        return Promise.resolve({} as ethers.providers.TransactionResponse);
    }

    // Function to read data from the contract
    async read(method: string, args: any[]): Promise<any> {
        // Code for reading data from the contract
        console.log(`Reading data from ${this.name} contract`);
        return Promise.resolve({} as any);
    }
}
