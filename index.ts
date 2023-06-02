import { Squid } from "@0xsquid/sdk";
import { SigningStargateClient, DeliverTxResponse } from "@cosmjs/stargate";
import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";

(async () => {
  const baseUrl = "http://localhost:3000";
  //const baseUrl = "https://squid-api-git-feat-dydx-poc2-v2-0xsquid.vercel.app";

  // instantiate the SDK
  const squid = new Squid({
    baseUrl: baseUrl,
  });
  // init the SDK
  await squid.init();
  console.log("Squid inited");

  const mnemonic =
    "muscle abuse foam practice elite foster glue immune steak thunder afraid soft";
  //const dydxRpc = "http://3.141.111.178:26657";
  const osmosisRpc = "https://rpc.osmotest5.osmosis.zone";

  const getSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "osmo",
    });
  };
  const signer: OfflineDirectSigner = await getSignerFromMnemonic();
  const signingClient = await SigningStargateClient.connectWithSigner(
    osmosisRpc,
    signer
  );

  const signerAddress = (await signer.getAccounts())[0].address;
  console.log(signerAddress);
  console.log("balances: ", await signingClient.getAllBalances(signerAddress));

  //nusdc:osmosis > avax:avalanche
  /*   const routeParams = {
    fromChain: "osmo-test-5",
    fromToken:
      "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
    fromAmount: "555555",
    cosmosSignerAddress: signerAddress,
    toChain: 43113,
    toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    toAddress: "0xb13CD07B22BC5A69F8500a1Cb3A1b65618d50B22",
    slippage: 3.0,
  }; */

  //ausdc:osmosis > avax:avalanche
  const routeParams = {
    fromChain: "osmo-test-5",
    fromToken:
      "ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE",
    fromAmount: "5555555",
    cosmosSignerAddress: signerAddress,
    toChain: 43113,
    toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    toAddress: "0xb13CD07B22BC5A69F8500a1Cb3A1b65618d50B22",
    slippage: 3.0,
  };

  const { route } = await squid.getRoute(routeParams);

  const cosmosTx = (await squid.executeRoute({
    signer: signingClient,
    signerAddress,
    route,
  })) as DeliverTxResponse;

  console.log(`COSMOS TX EXECUTION HASH: ${cosmosTx.transactionHash}`);
})();
