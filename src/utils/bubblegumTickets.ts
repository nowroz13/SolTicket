import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, none, publicKey, signerIdentity } from '@metaplex-foundation/umi';
import { createTree, mintV1 } from '@metaplex-foundation/mpl-bubblegum';

// Set up Umi client for devnet
const umi = createUmi('https://api.devnet.solana.com');

// Generate a new Umi-native signer for the payer/identity (for demo; replace with your own for production)
const payer = generateSigner(umi);
console.log('Umi payer public key:', payer.publicKey.toString());
umi.use(signerIdentity(payer));

// 1. Create a Merkle tree for an event
export async function createEventTree(maxDepth = 14, maxBufferSize = 64) {
  // Generate a new keypair for the tree
  const tree = generateSigner(umi);

  // Create the tree
  const txBuilder = createTree(umi, {
    merkleTree: tree,
    maxDepth,
    maxBufferSize,
  });
  const { signature } = await (await txBuilder).sendAndConfirm(umi);

  return {
    treeAddress: tree.publicKey,
    treeKeypair: tree,
    signature,
  };
}

// 2. Mint a compressed NFT (ticket) to an attendee
export async function mintTicketToAttendee(
  treeAddress: string,
  attendeeAddress: string,
  name: string,
  uri: string
) {
  // Mint the cNFT using Bubblegum
  const txBuilder = mintV1(umi, {
    merkleTree: publicKey(treeAddress),
    leafOwner: publicKey(attendeeAddress),
    metadata: {
      name,
      uri,
      sellerFeeBasisPoints: 0,
      collection: none(),
      creators: [
        { address: umi.identity.publicKey, verified: false, share: 100 },
      ],
    },
  });
  const { signature } = await (await txBuilder).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });

  return signature;
} 