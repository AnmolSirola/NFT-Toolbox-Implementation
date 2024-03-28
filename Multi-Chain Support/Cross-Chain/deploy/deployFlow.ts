import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { readFileSync } from 'fs';

const deployFlowContracts = async () => {
  fcl.config({
    'accessNode.api': process.env.FLOW_ACCESS_NODE,
    'discovery.wallet': process.env.FLOW_DISCOVERY_WALLET,
  });

  const authorization = async (account) => {
    const user = await fcl.reauthenticate();
    return fcl.authz.authorize(account);
  };

  // Deploy NftLinker contract
  const nftLinkerCode = readFileSync('./path/to/nft_linker/contract', 'utf8');
  const nftLinkerTx = await fcl.mutate({
    cadence: `
      transaction {
        prepare(acct: AuthAccount) {
          acct.contracts.add(name: "NftLinker", code: ${fcl.withPrefix(nftLinkerCode)})
        }
      }
    `,
    payer: fcl.authz,
    proposer: fcl.authz,
    authorizations: [authorization],
    limit: 9999,
  });
  console.log('NftLinker deployed on Flow at:', nftLinkerTx.id);

  // Deploy FlowNFT contract
  const flowNFTCode = readFileSync('./path/to/flow_nft/contract', 'utf8');
  const flowNFTTx = await fcl.mutate({
    cadence: `
      transaction {
        prepare(acct: AuthAccount) {
          acct.contracts.add(name: "FlowNFT", code: ${fcl.withPrefix(flowNFTCode)})
        }
      }
    `,
    payer: fcl.authz,
    proposer: fcl.authz,
    authorizations: [authorization],
    limit: 9999,
  });
  console.log('FlowNFT deployed on Flow at:', flowNFTTx.id);
};

deployFlowContracts();