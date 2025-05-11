const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { generateSigner, none, publicKey, signerIdentity } = require('@metaplex-foundation/umi');
const { createTree, mintV1 } = require('@metaplex-foundation/mpl-bubblegum');

// Set up Umi client for devnet
const umi = createUmi('https://api.devnet.solana.com');

// Generate a new Umi-native signer for the payer/identity (for demo; replace with your own for production)
const payer = generateSigner(umi);
console.log('Umi payer public key:', payer.publicKey.toString());
umi.use(signerIdentity(payer));

// 1. Create a Merkle tree for an event
async function createEventTree(maxDepth = 14, maxBufferSize = 64) {
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
async function mintTicketToAttendee(
  treeAddress,
  attendeeAddress,
  name,
  uri
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

module.exports = {
  createEventTree,
  mintTicketToAttendee,
};
