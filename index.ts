import { CosmosChain, Squid } from "@0xsquid/sdk";
import { SigningStargateClient, DeliverTxResponse } from "@cosmjs/stargate";
import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";

(async () => {
  const baseUrl = "https://squid-api-git-feat-cosmos-main-0xsquid.vercel.app";

  const squid = new Squid({
    baseUrl: baseUrl,
  });
  await squid.init();
  console.log("Squid inited");

  const mnemonic = "put your mnemonic here";
  //https://help.keplr.app/articles/how-to-view-your-seed-phrase#:~:text=Open%20your%20Keplr%20extension%20and,copy%20and%20export%20as%20needed.

  const chainId = "osmo-test-5";

  const chain = squid.chains.find(
    (c) => c.chainId.toString().toLocaleLowerCase() === chainId
  ) as CosmosChain;

  const getSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: chain.bech32Config.bech32PrefixAccAddr,
    });
  };
  const signer: OfflineDirectSigner = await getSignerFromMnemonic();
  const signingClient = await SigningStargateClient.connectWithSigner(
    chain.rpc,
    signer
  );

  const signerAddress = (await signer.getAccounts())[0].address;
  console.log(signerAddress);
  console.log("balances: ", await signingClient.getAllBalances(signerAddress));

  //ausdc:osmosis > avax:avalanche  no swaps
  const routeParams = {
    fromChain: chainId,
    fromToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "ausdc" && t.chainId === chainId
    )!.address,
    fromAmount: "555555",
    cosmosSignerAddress: signerAddress,
    toChain: 43113,
    toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    toAddress: "put your address here",
    slippage: 3.0,
  };

  //ausdc:osmosis > avax:avalanche
  /* const routeParams = {
    fromChain: "osmo-test-5",
    fromToken:
      "ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE",
    fromAmount: "5555555",
    cosmosSignerAddress: signerAddress,
    toChain: 43113,
    toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    toAddress: "0xb13CD07B22BC5A69F8500a1Cb3A1b65618d50B22",
    slippage: 3.0,
  }; */

  /* const routeParams = {
    fromChain: chainId,
    fromToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "usdc" && t.chainId === chainId
    )!.address,
    fromAmount: "600000",
    cosmosSignerAddress: signerAddress,
    toChain: 43113,
    toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    toAddress: "0xb13CD07B22BC5A69F8500a1Cb3A1b65618d50B22",
    slippage: 3.0,
  };

 */

  /*  const routeParams = {
    fromChain: chainId,
    fromToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "usdc" && t.chainId === chainId
    )!.address,
    fromAmount: "600000",
    cosmosSignerAddress: signerAddress,
    toChain: "osmo-test-5",
    toToken: squid.tokens.find(
      (t) =>
        t.symbol.toLocaleLowerCase() === "usdc" && t.chainId === "osmo-test-5"
    )!.address,
    toAddress: "0xb13CD07B22BC5A69F8500a1Cb3A1b65618d50B22",
    slippage: 3.0,
  }; */

  // nusdc:dydx > wavax:avalanche
  /*  const routeParams = {
    fromChain: chainId,
    fromToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "usdc" && t.chainId === chainId
    )!.address,
    fromAmount: "600000",
    cosmosSignerAddress: signerAddress,
    toChain: 43113,
    toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    toAddress: "0xb13CD07B22BC5A69F8500a1Cb3A1b65618d50B22",
    slippage: 3.0,
  };
 */
  console.log("route params: ", routeParams);

  const { route } = await squid.getRoute(routeParams);

  const cosmosTx = (await squid.executeRoute({
    signer: signingClient,
    signerAddress,
    route,
  })) as DeliverTxResponse;

  console.log(`COSMOS TX EXECUTION HASH: ${cosmosTx.transactionHash}`);
})();
