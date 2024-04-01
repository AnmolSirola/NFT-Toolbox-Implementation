import { deployUpgradable } from '@axelar-network/axelar-gmp-sdk-solidity';
import { Contract, ContractFactory } from 'ethers';
import { provider } from './ethereum.config';

const deployEthereumContracts = async () => {
  const wallet = new Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
  
  // Deploy NftLinker contract
  const NftLinker = await deployUpgradable(
    wallet,
    'NftLinker',
    [process.env.ETHEREUM_GATEWAY_ADDRESS, process.env.ETHEREUM_GAS_SERVICE_ADDRESS],
    wallet,
    process.env.ETHEREUM_GAS_AMOUNT
  );
  console.log('NftLinker deployed on Ethereum at:', NftLinker.address);

  // Deploy ERC721Demo contract
  const ERC721DemoFactory = new ContractFactory(ERC721Demo.abi, ERC721Demo.bytecode, wallet);
  const ERC721DemoContract = await ERC721DemoFactory.deploy('ERC721Demo', 'DEMO');
  await ERC721DemoContract.deployed();
  console.log('ERC721Demo deployed on Ethereum at:', ERC721DemoContract.address);
};

deployEthereumContracts();