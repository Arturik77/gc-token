import {
	percentAmount,
	generateSigner,
	signerIdentity,
	createSignerFromKeypair,
} from '@metaplex-foundation/umi';
import {
	TokenStandard,
	createAndMint,
} from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import '@solana/web3.js';
import secret from './guideSecret.json';
import { clusterApiUrl } from '@solana/web3.js';

const umi = createUmi(clusterApiUrl('devnet')); // RPC Endpoint

const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
const userWalletSigner = createSignerFromKeypair(umi, userWallet);

const metadata = {
	name: 'GC Token',
	symbol: 'GC',
	description: 'Token description',
	uri: 'https://ipfs.io/ipfs/bafkreif46tmogu2xxpq6ynjc56t7gcmcjklfneimuxmohmd5i5j7tqn6fi',
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
	.then(() => {
		console.log(
			'Successfully minted 5 million tokens (',
			mint.publicKey,
			')'
		);
	});
