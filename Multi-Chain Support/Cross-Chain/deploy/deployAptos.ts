import { AptosClient, AptosAccount, FaucetClient } from 'aptos';
import { readFileSync } from 'fs';

const deployAptosContracts = async () => {
  const client = new AptosClient(process.env.APTOS_RPC_URL);
  const faucetClient = new FaucetClient(process.env.APTOS_FAUCET_URL, client);
  const account = new AptosAccount(Buffer.from(process.env.APTOS_PRIVATE_KEY, 'hex'));

  // Fund the account
  await faucetClient.fundAccount(account.address(), 100000000);

  // Deploy NftLinker contract
  const nftLinkerModulePath = './path/to/nft_linker/module';
  const nftLinkerModule = readFileSync(nftLinkerModulePath, 'utf8');
  const nftLinkerDeployTx = await client.publishModule(account, nftLinkerModule);
  console.log('NftLinker deployed on Aptos at:', nftLinkerDeployTx.hash);

  // Deploy AptosNFT contract
  const aptosNFTModulePath = './path/to/aptos_nft/module';
  const aptosNFTModule = readFileSync(aptosNFTModulePath, 'utf8');
  const aptosNFTDeployTx = await client.publishModule(account, aptosNFTModule);
  console.log('AptosNFT deployed on Aptos at:', aptosNFTDeployTx.hash);
};

deployAptosContracts();