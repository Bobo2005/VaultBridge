import { createConfig, configureChains } from "wagmi";
import { sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";

// Custom Chain definition for Creditcoin USC Testnet
export const creditcoinTestnet = {
  id: 102031,
  name: "Creditcoin Testnet",
  network: "creditcoin-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Creditcoin",
    symbol: "tCTC",
  },
  rpcUrls: {
    public: { http: ["https://rpc.cc3-testnet.creditcoin.network"] },
    default: { http: ["https://rpc.cc3-testnet.creditcoin.network"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://creditcoin-testnet.blockscout.com" },
  },
  testnet: true,
} as const;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia, creditcoinTestnet],
  [publicProvider()]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: "Injected / MetaMask",
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains };
