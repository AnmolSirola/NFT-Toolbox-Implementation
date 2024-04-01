import { ethers } from 'ethers';
import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { AptosClient, AptosAccount, TokenClient } from 'aptos';
import * as fcl from '@onflow/fcl';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

const execute = async (sourceChain, destinationChain, tokenId, recipient) => {
  let sourceContract;
  let sourceWallet;
  
  switch (sourceChain) {
    case 'ethereum':
      const ethereumProvider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
      sourceWallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, ethereumProvider);
      sourceContract = new ethers.Contract(process.env.ETHEREUM_NFT_CONTRACT_ADDRESS, ERC721Demo.abi, sourceWallet);
      
      await sourceContract.approve(process.env.ETHEREUM_NFTLINKER_CONTRACT_ADDRESS, tokenId);
      
      const nftLinkerContract = new ethers.Contract(
        process.env.ETHEREUM_NFTLINKER_CONTRACT_ADDRESS,
        NftLinker.abi,
        sourceWallet
      );
      await nftLinkerContract.sendNFT(sourceContract.address, tokenId, destinationChain, recipient);
      break;
      
    case 'solana':
      const solanaConnection = new Connection(process.env.SOLANA_RPC_URL);
      sourceWallet = Keypair.fromSecretKey(Buffer.from(process.env.SOLANA_PRIVATE_KEY, 'base64'));
      
      const approveTx = new Transaction().add(
        Token.createApproveInstruction(
          TOKEN_PROGRAM_ID,
          new PublicKey(process.env.SOLANA_NFT_TOKEN_ADDRESS),
          new PublicKey(process.env.SOLANA_NFTLINKER_PROGRAM_ADDRESS),
          sourceWallet.publicKey,
          [],
          1
        )
      );
      await solanaConnection.sendTransaction(approveTx, [sourceWallet]);
      
      const sendNftTx = new Transaction().add(
        await program.instruction.sendNft(
          new PublicKey(sourceWallet.publicKey),
          new PublicKey(recipient),
          new PublicKey(destinationChain),
          new PublicKey(tokenId)
        )
      );
      await solanaConnection.sendTransaction(sendNftTx, [sourceWallet]);
      break;
      
    case 'aptos':
      const aptosClient = new AptosClient(process.env.APTOS_RPC_URL);
      sourceWallet = new AptosAccount(Buffer.from(process.env.APTOS_PRIVATE_KEY, 'hex'));
      const tokenClient = new TokenClient(aptosClient);
      
      await tokenClient.approveToken(
        sourceWallet,
        process.env.APTOS_NFT_COLLECTION_NAME,
        process.env.APTOS_NFT_TOKEN_NAME,
        tokenId,
        process.env.APTOS_NFTLINKER_CONTRACT_ADDRESS,
        1
      );
      
      await aptosClient.sendTransaction(sourceWallet, {
        type: 'entry_function_payload',
        function: `${process.env.APTOS_NFTLINKER_CONTRACT_ADDRESS}::send_nft`,
        arguments: [
          process.env.APTOS_NFT_COLLECTION_NAME,
          process.env.APTOS_NFT_TOKEN_NAME,
          tokenId,
          destinationChain,
          recipient
        ],
      });
      break;
      
    case 'flow':
      fcl.config({
        'accessNode.api': process.env.FLOW_ACCESS_NODE,
        'discovery.wallet': process.env.FLOW_DISCOVERY_WALLET,
      });
      sourceWallet = await fcl.reauthenticate();
      
      const approvalTx = await fcl.mutate({
        cadence: `
          import FlowNFT from 0x${process.env.FLOW_NFT_CONTRACT_ADDRESS}
          import NftLinker from 0x${process.env.FLOW_NFTLINKER_CONTRACT_ADDRESS}
          
          transaction(tokenId: UInt64) {
            prepare(account: AuthAccount) {
              let nft <- account.load<@FlowNFT.NFT>(from: FlowNFT.nftStoragePath(tokenId: tokenId))!
              account.save(<-nft, to: NftLinker.approvePath(tokenId: tokenId))
            }
          }
        `,
        args: (arg, t) => [arg(tokenId, t.UInt64)],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      
      const sendNftTx = await fcl.mutate({
        cadence: `
          import NftLinker from 0x${process.env.FLOW_NFTLINKER_CONTRACT_ADDRESS}
          
          transaction(tokenId: UInt64, destinationChain: String, recipient: Address) {
            prepare(account: AuthAccount) {
              NftLinker.sendNFT(tokenId: tokenId, destinationChain: destinationChain, recipient: recipient)
            }
          }
        `,
        args: (arg, t) => [
          arg(tokenId, t.UInt64),
          arg(destinationChain, t.String),
          arg(recipient, t.Address)
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      break;
      
    case 'tezos':
      const tezosToolkit = new TezosToolkit(process.env.TEZOS_RPC_URL);
      sourceWallet = await InMemorySigner.fromSecretKey(process.env.TEZOS_PRIVATE_KEY);
      tezosToolkit.setProvider({ signer: sourceWallet });
      
      const nftContract = await tezosToolkit.contract.at(process.env.TEZOS_NFT_CONTRACT_ADDRESS);
      const nftLinkerContract = await tezosToolkit.contract.at(process.env.TEZOS_NFTLINKER_CONTRACT_ADDRESS);
      
      const approveParams = MichelsonMap.fromLiteral({
        operator: {
          address: process.env.TEZOS_NFTLINKER_CONTRACT_ADDRESS,
          token_id: tokenId,
        },
        owner: {
          address: sourceWallet.publicKeyHash(),
          token_id: tokenId,
        },
      });
      await nftContract.methods.update_operators([{ add_operator: approveParams }]).send();
      
      await nftLinkerContract.methods.send_nft(
        process.env.TEZOS_NFT_CONTRACT_ADDRESS,
        tokenId,
        destinationChain,
        recipient
      ).send({ amount: 0 });
      break;
      
    default:
      throw new Error('Unsupported source chain');
  }

  let destinationContract;
  switch (destinationChain) {
    case 'ethereum':
      const ethereumProvider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
      destinationContract = new ethers.Contract(process.env.ETHEREUM_NFT_CONTRACT_ADDRESS, ERC721Demo.abi, ethereumProvider);
      
      const ethereumOwner = await destinationContract.ownerOf(tokenId);
      console.log(`NFT owner on Ethereum: ${ethereumOwner}`);
      break;
      
    case 'solana':
      const solanaConnection = new Connection(process.env.SOLANA_RPC_URL);
      const solanaTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(process.env.SOLANA_NFT_TOKEN_ADDRESS),
        new PublicKey(recipient)
      );
      const solanaOwner = await solanaConnection.getTokenAccountBalance(solanaTokenAccount);
      console.log(`NFT owner on Solana: ${solanaOwner}`);
      break;
      
    case 'aptos':
      const aptosClient = new AptosClient(process.env.APTOS_RPC_URL);
      const tokenClient = new TokenClient(aptosClient);
      
      const aptosOwner = await tokenClient.getTokenOwner(process.env.APTOS_NFT_COLLECTION_NAME, process.env.APTOS_NFT_TOKEN_NAME, tokenId);
      console.log(`NFT owner on Aptos: ${aptosOwner}`);
      break;
      
    case 'flow':
      const flowOwnerScript = `
        import FlowNFT from 0x${process.env.FLOW_NFT_CONTRACT_ADDRESS}
        
        pub fun main(tokenId: UInt64): Address {
          let nft = FlowNFT.getNFT(tokenId: tokenId)
          return nft.owner!.address
        }
      `;
      const flowOwner = await fcl.query({
        cadence: flowOwnerScript,
        args: (arg, t) => [arg(tokenId, t.UInt64)],
      });
      console.log(`NFT owner on Flow: ${flowOwner}`);
      break;
      
    case 'tezos':
      const tezosToolkit = new TezosToolkit(process.env.TEZOS_RPC_URL);
      const tezosNftContract = await tezosToolkit.contract.at(process.env.TEZOS_NFT_CONTRACT_ADDRESS);
      
      const tezosOwner = await tezosNftContract.storage.token_metadata.get(tokenId);
      console.log(`NFT owner on Tezos: ${tezosOwner}`);
      break;
      
    default:
      throw new Error('Unsupported destination chain');
  }
  
  console.log('Cross-chain NFT transfer completed successfully');
};