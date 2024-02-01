import {
  percentAmount,
  generateSigner,
  signerIdentity,
  createSignerFromKeypair,
} from "@metaplex-foundation/umi";
import {
  TokenStandard,
  createAndMint,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import "@solana/web3.js";
import secret from "./guideSecret.json";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AuthorityType, setAuthority } from "@solana/spl-token";

const umi = createUmi(clusterApiUrl("devnet")); // RPC Endpoint

const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
const userWalletSigner = createSignerFromKeypair(umi, userWallet);

const metadata = {
  name: "GC Token",
  symbol: "GC",
  description: "Token description",
  uri: "https://ipfs.io/ipfs/bafkreif46tmogu2xxpq6ynjc56t7gcmcjklfneimuxmohmd5i5j7tqn6fi",
};

const mint = generateSigner(umi);
umi.use(signerIdentity(userWalletSigner));
umi.use(mplCandyMachine());

createAndMint(umi, {
  mint,
  authority: umi.identity,
  name: metadata.name,
  symbol: metadata.symbol,
  uri: metadata.uri,
  sellerFeeBasisPoints: percentAmount(0),
  decimals: 6,
  amount: 5000000_000000,
  tokenOwner: userWallet.publicKey,
  tokenStandard: TokenStandard.Fungible,
})
  .sendAndConfirm(umi)
  .then(async () => {
    console.log("Successfully minted 5 million tokens (", mint.publicKey, ")");

    await revokeMintAuthority(mint.publicKey);

    await revokeFreezeAuthority(mint.publicKey);

    console.log(
      `Successfully deployed token: ${metadata.name} ${metadata.symbol}`
    );
  });

async function revokeMintAuthority(account: string) {
  const mint: PublicKey = new PublicKey(account);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const payer = Keypair.fromSecretKey(new Uint8Array(secret));

  await setAuthority(
    connection,
    payer,
    mint,
    payer,
    AuthorityType.MintTokens,
    null
  );

  console.log("Successfully revoked Mint Authority");
}

async function revokeFreezeAuthority(account: string) {
  const mint: PublicKey = new PublicKey(account);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const payer = Keypair.fromSecretKey(new Uint8Array(secret));

  await setAuthority(
    connection,
    payer,
    mint,
    payer,
    AuthorityType.FreezeAccount,
    null
  );

  console.log("Successfully revoked Freeze Authority");
}
