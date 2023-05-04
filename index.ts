import { Squid } from "@0xsquid/sdk";
import { SigningStargateClient, DeliverTxResponse } from "@cosmjs/stargate";
import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";

(async () => {
  const mnemonic = "your mnemonic here";
  const dydxRpc = "http://3.141.111.178:26657";
  const dydxChainId = "dydxprotocol-testnet";
  const nUSDCOnDydx =
    "ibc/39549F06486BACA7494C9ACDD53CDD30AA9E723AB657674DBD388F867B61CA7B";

  //const baseUrl = "http://localhost:3000";
  const baseUrl = "https://squid-api-git-feat-dydx-poc2-v2-0xsquid.vercel.app";

  const getSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "dydx",
    });
  };
  const signer: OfflineDirectSigner = await getSignerFromMnemonic();
  const signingClient = await SigningStargateClient.connectWithSigner(
    dydxRpc,
    signer
  );

  const signerAddress = (await signer.getAccounts())[0].address;
  console.log(signerAddress);
  console.log("balances: ", await signingClient.getAllBalances(signerAddress));

  // instantiate the SDK
  const squid = new Squid({
    baseUrl: baseUrl,
  });
  // init the SDK
  await squid.init();
  console.log("Squid inited");

  const routeParams = {
    fromChain: dydxChainId,
    fromToken: nUSDCOnDydx,
    fromAmount: "555555",
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
