const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Keypair, Connection, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { createRpc } = require('@lightprotocol/stateless.js');
const { createMint, mintTo } = require('@lightprotocol/compressed-token');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');
// TODO: Import your Solana mint logic here (e.g., Metaplex, Bubblegum, or Light Protocol)

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load server wallet from local keypair file (adjust path as needed)
const WALLET_PATH = process.env.SERVER_WALLET || path.join(__dirname, 'server-keypair.json');
const secret = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf8'));
const serverKeypair = Keypair.fromSecretKey(Uint8Array.from(secret));

const connection = new Connection('https://api.devnet.solana.com');
const rpc = createRpc('https://api.devnet.solana.com', 'https://api.devnet.solana.com', 'https://api.devnet.solana.com');

// Transaction request endpoint for Solana Pay
app.get('/api/tx', async (req, res) => {
  try {
    const { account, eventId, imageUrl, eventName, eventDescription } = req.query;
    if (!account || !eventId) {
      return res.status(400).json({ error: 'Missing account or eventId' });
    }
    const payer = new PublicKey(account);

    // Metadata for the cNFT
    const metadata = {
      name: eventName || `Event Ticket #${eventId}`,
      symbol: 'EVT',
      image: imageUrl || 'https://placehold.co/400x400',
      description: eventDescription || `Ticket for event ${eventId}`,
      attributes: [
        { traitType: 'Event ID', value: eventId },
        { traitType: 'Type', value: 'Event Ticket' }
      ]
    };

    // Mint the compressed NFT using Light Protocol
    const { mint } = await createMint(
      rpc,
      serverKeypair,
      serverKeypair,
      0 // decimals for NFT
    );

    // Build the mintTo instruction
    const mintToIx = await mintTo(
      rpc,
      mint,
      payer,
      serverKeypair,
      1, // amount
      true // returnIxOnly
    );

    // Build the transaction
    const tx = new Transaction().add(mintToIx);
    tx.feePayer = payer;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Server signs the transaction (for mint authority)
    tx.partialSign(serverKeypair);

    // Serialize and return the transaction (base64)
    const serialized = tx.serialize({ requireAllSignatures: false });
    res.json({ transaction: serialized.toString('base64') });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// (Optional) Keep /api/mint for legacy/manual minting
app.post('/api/mint', async (req, res) => {
  const { payer, reference, eventId, imageUrl, eventName, eventDescription } = req.body;
  try {
    const metadata = {
      name: eventName || `Event Ticket #${eventId}`,
      symbol: 'EVT',
      image: imageUrl || 'https://placehold.co/400x400',
      description: eventDescription || `Ticket for event ${eventId}`,
      attributes: [
        { traitType: 'Event ID', value: eventId },
        { traitType: 'Type', value: 'Event Ticket' }
      ]
    };
    const { mint } = await createMint(
      rpc,
      serverKeypair,
      serverKeypair,
      0
    );
    await mintTo(
      rpc,
      mint,
      new PublicKey(payer),
      serverKeypair,
      1
    );
    res.json({ success: true, mint: mint.toString(), message: 'Minted cNFT to payer!' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 