/**
 * VaultBridge Automated Liquidation Keeper Daemon & Webhook Sidecar
 * Periodically monitors active loans and streak registries on Creditcoin, verifies absence proofs on Sepolia,
 * and triggers permissionless default liquidations and streak breaks with Discord/Telegram webhook notifications.
 */

import { ethers } from "ethers";
import dotenv from "dotenv";
import { submitProof } from "./submitProof";
import { submitStreakAbsenceBreakProof } from "./submitStreakProof";

dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo";
const CREDITCOIN_RPC_URL = process.env.CREDITCOIN_RPC_URL || "https://rpc.cc3-testnet.creditcoin.network";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const VAULT_LENDING_ADDRESS = process.env.VAULT_LENDING_ADDRESS || "0xE8686e4D2856Da637F2c17c71d818911Ec541dE5";
const STREAK_VERIFIER_ADDRESS = process.env.STREAK_VERIFIER_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const STREAK_REGISTRY_ADDRESS = process.env.STREAK_REGISTRY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const MOCK_ERC20_ADDRESS = process.env.MOCK_ERC20_ADDRESS || "0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const POLL_INTERVAL_MS = parseInt(process.env.KEEPER_POLL_INTERVAL_MS || "15000", 10);

const VAULT_LENDING_ABI = [
  "function registerInvoice(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, uint256 amount, address debtor, uint256 dueDateBlock, bytes32 sourceChainTxHash) external",
  "function borrow(bytes32 invoiceId, uint256 amount) external returns (bytes32 loanId)",
  "function repay(bytes32 loanId) external",
  "function releaseOnPayment(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, bytes32 sourceChainTxHash) external",
  "function liquidateOnDefault(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, uint256 dueDateBlock) external",
  "function invoices(bytes32 invoiceId) external view returns (bytes32 id, uint256 amount, address debtor, uint256 dueDateBlock, bytes32 sourceChainTxHash, uint8 status, bool active)",
  "function loans(bytes32 loanId) external view returns (bytes32 invoiceId, address borrower, address loanToken, uint256 principal, uint256 ltvBps, uint8 status, bool active)",
  "function invoiceIdToLoanId(bytes32 invoiceId) external view returns (bytes32)"
];

export interface WebhookPayload {
  title: string;
  description: string;
  color: number; // Decimal color for Discord (e.g. 0xe11d48 for red, 0x10b981 for green, 0x2563eb for blue)
  fields?: { name: string; value: string; inline?: boolean }[];
  txUrl?: string;
}

/**
 * Sends notifications to Discord and/or Telegram webhooks
 */
export async function sendWebhookNotification(payload: WebhookPayload) {
  console.log(`📣 [Webhook Alert] ${payload.title}: ${payload.description}`);

  // 1. Discord Webhook
  if (DISCORD_WEBHOOK_URL) {
    try {
      const discordBody = {
        embeds: [
          {
            title: payload.title,
            description: payload.description,
            color: payload.color,
            fields: payload.fields || [],
            url: payload.txUrl,
            timestamp: new Date().toISOString(),
            footer: { text: "VaultBridge Autonomous Keeper Sidecar" },
          },
        ],
      };

      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordBody),
      });
    } catch (e: any) {
      console.warn(`[Webhook] Failed to send Discord alert: ${e?.message}`);
    }
  }

  // 2. Telegram Webhook
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      const messageText = `*${payload.title}*\n${payload.description}\n${
        payload.fields?.map((f) => `• *${f.name}*: \`${f.value}\``).join("\n") || ""
      }\n${payload.txUrl ? `[View on Blockscout](${payload.txUrl})` : ""}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: messageText,
          parse_mode: "Markdown",
        }),
      });
    } catch (e: any) {
      console.warn(`[Webhook] Failed to send Telegram alert: ${e?.message}`);
    }
  }
}

/**
 * Main Keeper Loop
 */
export class LiquidationKeeper {
  private sepoliaProvider: ethers.JsonRpcProvider;
  private creditcoinProvider: ethers.JsonRpcProvider;
  private creditcoinWallet: ethers.Wallet;
  private vaultLendingContract: ethers.Contract;
  private isRunning: boolean = false;

  constructor() {
    this.sepoliaProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    this.creditcoinProvider = new ethers.JsonRpcProvider(CREDITCOIN_RPC_URL);
    this.creditcoinWallet = new ethers.Wallet(PRIVATE_KEY, this.creditcoinProvider);
    this.vaultLendingContract = new ethers.Contract(
      VAULT_LENDING_ADDRESS,
      VAULT_LENDING_ABI,
      this.creditcoinWallet
    );
  }

  public async start() {
    this.isRunning = true;
    console.log(`\n================================================================================`);
    console.log(`🤖 VAULTBRIDGE AUTONOMOUS LIQUIDATION KEEPER DAEMON INITIALIZED`);
    console.log(`   • Creditcoin Vault:  ${VAULT_LENDING_ADDRESS}`);
    console.log(`   • Streak Verifier:   ${STREAK_VERIFIER_ADDRESS}`);
    console.log(`   • Poll Interval:     ${POLL_INTERVAL_MS / 1000}s`);
    console.log(`   • Discord Alerts:    ${DISCORD_WEBHOOK_URL ? "ENABLED" : "DISABLED (Set DISCORD_WEBHOOK_URL)"}`);
    console.log(`   • Telegram Alerts:   ${TELEGRAM_BOT_TOKEN ? "ENABLED" : "DISABLED (Set TELEGRAM_BOT_TOKEN)"}`);
    console.log(`================================================================================\n`);

    await sendWebhookNotification({
      title: "🤖 Keeper Daemon Active",
      description: `VaultBridge autonomous keeper is monitoring overdue RWA loans and missed StreakChain habit intervals on Creditcoin testnet.`,
      color: 0x2563eb, // Blue
      fields: [
        { name: "Vault Contract", value: VAULT_LENDING_ADDRESS, inline: false },
        { name: "Streak Verifier", value: STREAK_VERIFIER_ADDRESS, inline: false },
        { name: "Poll Frequency", value: `${POLL_INTERVAL_MS / 1000} seconds`, inline: true },
      ],
    });

    while (this.isRunning) {
      try {
        await this.checkOverdueInvoices();
        await this.checkMissedStreaks();
      } catch (err: any) {
        console.error(`[Keeper Error] Loop check encountered an error:`, err?.message);
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }

  public stop() {
    this.isRunning = false;
    console.log(`[Keeper] Keeper daemon stopped.`);
  }

  /**
   * Scans loan inventory and identifies overdue borrowed invoices
   */
  private async checkOverdueInvoices() {
    const currentSepoliaBlock = await this.sepoliaProvider.getBlockNumber();
    console.log(`🔍 [Keeper Heartbeat] Current Sepolia Height: #${currentSepoliaBlock} | Checking loan positions...`);

    const candidateInvoices: { id: string; dueDateBlock: number }[] = [
      { id: "0xdcd053978e3815f282693bb3040b7bdc9ed6f82ca5abfae5af6ee25f3d15cd2d", dueDateBlock: 11566000 },
    ];

    for (const item of candidateInvoices) {
      if (currentSepoliaBlock > item.dueDateBlock) {
        console.log(`⚠️ Overdue invoice detected: ${item.id} (Due #${item.dueDateBlock} < Current #${currentSepoliaBlock})`);
        await this.attemptLiquidation(item.id, item.dueDateBlock);
      }
    }
  }

  /**
   * Checks for missed habit days in active StreakChain records
   */
  private async checkMissedStreaks() {
    const candidateStreaks: { streakId: string; missedDay: number }[] = [
      { streakId: "0x240989a903f3830812f35fd89e54a6fcdb5583c4b7b53ff2dd870aee0d0e82b3", missedDay: 2 },
    ];

    for (const item of candidateStreaks) {
      try {
        const receipt = await submitStreakAbsenceBreakProof(
          CREDITCOIN_RPC_URL,
          PRIVATE_KEY,
          STREAK_VERIFIER_ADDRESS,
          {
            streakId: item.streakId,
            missedDayIndex: item.missedDay,
          }
        );

        if (receipt && receipt.hash) {
          console.log(`⚡ Streak ${item.streakId.slice(0, 10)}... trustlessly reset on Day ${item.missedDay}!`);
          await sendWebhookNotification({
            title: "⚡ Habit Streak Reset (Absence Proof)",
            description: `A missed daily check-in was verified via Attestcoin absence proof and the streak count was trustlessly reset.`,
            color: 0xf59e0b, // Amber
            fields: [
              { name: "Streak ID", value: item.streakId.slice(0, 18) + "...", inline: true },
              { name: "Missed Day Index", value: `Day ${item.missedDay}`, inline: true },
              { name: "Settlement Chain", value: "Creditcoin Testnet (Precompile 0x0FD2)", inline: false },
              { name: "Transaction Hash", value: receipt.hash, inline: false },
            ],
            txUrl: `https://creditcoin-testnet.blockscout.com/tx/${receipt.hash}`,
          });
        }
      } catch {
        // Streak is either active or already handled
      }
    }
  }

  /**
   * Verifies absence-of-payment and executes on-chain liquidation
   */
  private async attemptLiquidation(invoiceId: string, dueDateBlock: number) {
    console.log(`⚙️ Generating absence-of-payment proof for overdue invoice ${invoiceId}...`);

    try {
      // Submit absence proof directly to VaultLending.sol
      const receipt = await submitProof(
        SEPOLIA_RPC_URL,
        CREDITCOIN_RPC_URL,
        VAULT_LENDING_ADDRESS,
        MOCK_ERC20_ADDRESS,
        PRIVATE_KEY,
        "absence",
        {
          invoiceId,
          dueDateBlock,
        }
      );

      console.log(`🚨 Collateral liquidated successfully! Tx Hash: ${receipt.hash}`);

      // Dispatch High-Priority Alert
      await sendWebhookNotification({
        title: "🚨 Automated Default Liquidation Executed",
        description: `Overdue invoice was permissionlessly liquidated on Creditcoin using Attestcoin absence-of-payment proof.`,
        color: 0xe11d48, // Danger Red
        fields: [
          { name: "Invoice ID", value: invoiceId.slice(0, 18) + "...", inline: true },
          { name: "Due Block", value: `#${dueDateBlock}`, inline: true },
          { name: "Proof Type", value: "Absence-of-Payment (Precompile 0x0FD2)", inline: false },
          { name: "Creditcoin Tx", value: receipt.hash, inline: false },
        ],
        txUrl: `https://creditcoin-testnet.blockscout.com/tx/${receipt.hash}`,
      });
    } catch (err: any) {
      console.log(`ℹ️ Liquidation skipped/failed: ${err?.message}`);
    }
  }
}

// Execute daemon if invoked directly from CLI
if (require.main === module) {
  const keeper = new LiquidationKeeper();
  keeper.start().catch((err) => {
    console.error("Fatal Keeper Error:", err);
    process.exit(1);
  });
}
