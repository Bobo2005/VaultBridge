import { NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseUnits, formatUnits, isAddress, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const creditcoinTestnet = defineChain({
  id: 102031,
  name: "Creditcoin Testnet",
  network: "creditcoin-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Creditcoin",
    symbol: "tCTC",
  },
  rpcUrls: {
    default: { http: ["https://rpc.cc3-testnet.creditcoin.network"] },
    public: { http: ["https://rpc.cc3-testnet.creditcoin.network"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://creditcoin-testnet.blockscout.com" },
  },
  testnet: true,
});

const PRIVATE_KEY = (process.env.PRIVATE_KEY || "0x789dce8201af247ef3daab076d9e314c829685654cdc678488cd646043ba6ca2") as `0x${string}`;
const MOCK_ERC20_ADDRESS = (process.env.NEXT_PUBLIC_MOCK_ERC20_ADDRESS || "0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714") as `0x${string}`;

const MOCK_ERC20_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recipient = body.recipient;

    if (!recipient || !isAddress(recipient)) {
      return NextResponse.json(
        { error: "Invalid recipient address provided." },
        { status: 400 }
      );
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = http("https://rpc.cc3-testnet.creditcoin.network");

    const publicClient = createPublicClient({ chain: creditcoinTestnet, transport });
    const walletClient = createWalletClient({ account, chain: creditcoinTestnet, transport });

    const requestedAmount = Number(body.amount) || 10000;
    const claimAmount = parseUnits(requestedAmount.toString(), 18);

    let txHash: `0x${string}`;
    try {
      txHash = await walletClient.writeContract({
        address: MOCK_ERC20_ADDRESS,
        abi: MOCK_ERC20_ABI,
        functionName: "faucet",
        args: [recipient as `0x${string}`, claimAmount],
      });
    } catch (faucetErr) {
      txHash = await walletClient.writeContract({
        address: MOCK_ERC20_ADDRESS,
        abi: MOCK_ERC20_ABI,
        functionName: "mint",
        args: [recipient as `0x${string}`, claimAmount],
      });
    }

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    const newBal = await publicClient.readContract({
      address: MOCK_ERC20_ADDRESS,
      abi: MOCK_ERC20_ABI,
      functionName: "balanceOf",
      args: [recipient as `0x${string}`],
    });

    return NextResponse.json({
      success: true,
      txHash,
      blockNumber: Number(receipt.blockNumber),
      recipient,
      amount: requestedAmount.toString(),
      newBalanceFormatted: formatUnits(newBal, 18),
      explorerUrl: `https://creditcoin-testnet.blockscout.com/tx/${txHash}`,
    });
  } catch (err: any) {
    console.error("Relayer Faucet Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to disburse faucet tokens." },
      { status: 500 }
    );
  }
}
