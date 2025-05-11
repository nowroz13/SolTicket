import { Keypair, PublicKey, ComputeBudgetProgram } from '@solana/web3.js';
import {
  CompressedTokenProgram,
  getTokenPoolInfos,
  selectTokenPoolInfo,
} from '@lightprotocol/compressed-token';
import {
  bn,
  buildAndSignTx,
  calculateComputeUnitPrice,
  createRpc,
  dedupeSigner,
  selectStateTreeInfo,
  sendAndConfirmTx,
} from '@lightprotocol/stateless.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import bs58 from 'bs58';

// You may want to load these from environment variables or user input
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const MINT_ADDRESS = new PublicKey('REPLACE_WITH_YOUR_MINT_ADDRESS');
const PAYER = Keypair.fromSecretKey(bs58.decode('REPLACE_WITH_YOUR_PRIVATE_KEY_BASE58'));
const connection = createRpc(RPC_ENDPOINT);

export async function airdropCompressedToken(recipientAddress: string, amountNumber: number = 1) {
  // 1. Get state tree and token pool info
  const activeStateTrees = await connection.getStateTreeInfos();
  const treeInfo = selectStateTreeInfo(activeStateTrees);
  const infos = await getTokenPoolInfos(connection, MINT_ADDRESS);
  const info = selectTokenPoolInfo(infos);

  // 2. Get your source token account
  const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    PAYER,
    MINT_ADDRESS,
    PAYER.publicKey
  );

  // 3. Prepare recipient
  const airDropAddresses = [new PublicKey(recipientAddress)];
  const amount = bn(amountNumber);

  // 4. Build instructions
  const instructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 120_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: calculateComputeUnitPrice(20_000, 120_000),
    }),
    await CompressedTokenProgram.compress({
      payer: PAYER.publicKey,
      owner: PAYER.publicKey,
      source: sourceTokenAccount.address,
      toAddress: airDropAddresses,
      amount: airDropAddresses.map(() => amount),
      mint: MINT_ADDRESS,
      tokenPoolInfo: info,
      outputStateTreeInfo: treeInfo,
    }),
  ];

  // 5. Build, sign, and send the transaction
  const additionalSigners = dedupeSigner(PAYER, [PAYER]);
  const { blockhash } = await connection.getLatestBlockhash();
  const tx = buildAndSignTx(instructions, PAYER, blockhash, additionalSigners);
  const txId = await sendAndConfirmTx(connection, tx);
  return txId;
} 