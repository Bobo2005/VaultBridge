import { ethers } from "ethers";
import {
  generateSymmetricKey,
  encryptPayload,
  decryptPayload,
  wrapKey,
  unwrapKey,
  uploadBlob,
  fetchBlob,
  clearBlobStore,
} from "../src";

describe("Privacy Layer Crypto Roundtrip Tests", () => {
  beforeEach(() => {
    clearBlobStore();
  });

  it("should complete a full encrypt -> wrap -> unwrap -> decrypt roundtrip byte-for-byte", async () => {
    // 1. Setup recipient wallet (grantee)
    const recipientWallet = ethers.Wallet.createRandom();
    const recipientPubKey = recipientWallet.signingKey.publicKey; // 65-byte uncompressed 0x04...
    const recipientPrivKey = recipientWallet.privateKey;

    // 2. Sensitive invoice payload
    const originalInvoiceData = {
      invoiceId: "INV-2026-001",
      amountEth: 10.0,
      amountUsd: 27000,
      debtor: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
      dueDateBlock: 11568000,
      issuerCompany: "Acme Trade Corp",
      bankIBAN: "US89370400440532013000",
      notes: "Strict 30-day payment term; confidentiality required.",
    };

    // 3. Generate symmetric key K and encrypt payload
    const symmetricKey = generateSymmetricKey();
    expect(symmetricKey).toHaveLength(64); // 32 bytes in hex

    const encrypted = await encryptPayload(originalInvoiceData, symmetricKey);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();
    expect(encrypted.commitment).toBeDefined();

    // Verify commitment is sha256 of the ciphertext
    const expectedCommitment = ethers.sha256(ethers.toUtf8Bytes(encrypted.ciphertext));
    expect(encrypted.commitment).toBe(expectedCommitment);

    // 4. Wrap symmetric key with recipient's public key
    const wrappedKeyJson = await wrapKey(symmetricKey, recipientPubKey);
    expect(wrappedKeyJson).toBeDefined();

    // 5. Store ciphertext in off-chain blob store
    const pointer = await uploadBlob(encrypted.ciphertext);
    expect(pointer).toMatch(/^ipfs:\/\/bafkrei/);

    // 6. Recipient fetches ciphertext blob from off-chain store
    const fetchedCiphertext = await fetchBlob(pointer);
    expect(fetchedCiphertext).toBe(encrypted.ciphertext);

    // 7. Recipient unwraps symmetric key using their private key
    const unwrappedKey = await unwrapKey(wrappedKeyJson, recipientPrivKey);
    expect(unwrappedKey).toBe(symmetricKey);

    // 8. Recipient decrypts the payload
    const decryptedPayload = await decryptPayload(
      {
        ...encrypted,
        ciphertext: fetchedCiphertext,
      },
      unwrappedKey
    );

    // 9. Assert exact byte-for-byte deep equality
    expect(decryptedPayload).toEqual(originalInvoiceData);
  });

  it("should fail unwrapping when an unauthorized private key is used", async () => {
    const authorizedWallet = ethers.Wallet.createRandom();
    const attackerWallet = ethers.Wallet.createRandom();

    const symmetricKey = generateSymmetricKey();
    const wrappedKeyJson = await wrapKey(symmetricKey, authorizedWallet.signingKey.publicKey);

    // Attacker tries to unwrap key meant for authorized wallet
    await expect(unwrapKey(wrappedKeyJson, attackerWallet.privateKey)).rejects.toThrow();
  });

  it("should fail decryption if ciphertext or authentication tag is tampered with", async () => {
    const symmetricKey = generateSymmetricKey();
    const data = { secret: "confidential trade terms" };
    const encrypted = await encryptPayload(data, symmetricKey);

    // Tamper with auth tag
    const tamperedPayload = {
      ...encrypted,
      authTag: Buffer.from("00000000000000000000000000000000", "hex").toString("base64"),
    };

    await expect(decryptPayload(tamperedPayload, symmetricKey)).rejects.toThrow();
  });
});
