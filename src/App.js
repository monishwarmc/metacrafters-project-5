import React, { useState, useEffect } from 'react';
import './App.css';
import { Buffer } from 'buffer';
import {
  Keypair,
  Connection,
  SystemProgram,
  clusterApiUrl,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import img from './solana.png';
import './App.css';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

function App() {
  global.Buffer = global.Buffer || Buffer;


  const [accountKeypair, setAccountKeypair] = useState(null);
  const [balance, setBalance] = useState(null);
  const [balanceW, setWBalance] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletPublicKey, setWalletPublicKey] = useState('');

  useEffect(() => {
    const checkPhantomWallet = async () => {
      if ('solana' in window) {
        const { solana } = window;
        await solana.connect();
        if (solana.isConnected) {
          setWalletConnected(true);
          setWalletPublicKey(solana.publicKey.toString());
        }
      }
    };

    checkPhantomWallet();
  }, []);

  const createSolanaAccount = async () => {
    const keypair = Keypair.generate();
    setAccountKeypair(keypair);
  };

  const connectToWallet = async () => {
    if ('solana' in window) {
      const { solana } = window;
      await solana.connect();
      if (solana.isConnected) {
        setWalletConnected(true);
        setWalletPublicKey(solana.publicKey.toString());
      }
    } else {
      window.open('https://phantom.app/', '_blank');
    }
  };
  const transferToWallet = async (e) => {
  e.preventDefault();
  let amount = e.target.amount.value;
  console.log(amount);
  if (accountKeypair && walletConnected) {
    const accountBalance = await connection.getBalance(accountKeypair.publicKey);

    // Check if the account has sufficient balance
    if (accountBalance < 0.5) {
      console.log('Insufficient balance');
      return;
    }

    

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: accountKeypair.publicKey,
        toPubkey: walletPublicKey,
        lamports: amount*LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [accountKeypair]);
    console.log(signature);

    setBalance(await connection.getBalance(accountKeypair.publicKey) / LAMPORTS_PER_SOL);
  }
};

  const airdrop2 = async() => {
    const airdropTx = await connection.requestAirdrop(
      accountKeypair.publicKey,
      2*LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx);
    setBalance(await connection.getBalance(accountKeypair.publicKey)/LAMPORTS_PER_SOL);
  };
  const getBalance = async() => {
    let balance = await connection.getBalance(accountKeypair.publicKey);
    setBalance(balance/LAMPORTS_PER_SOL);
  };

const getWBalance = async () => {
  console.log('walletPublicKey:', walletPublicKey);
  console.log('walletPublicKey type:', typeof walletPublicKey);
  if (walletPublicKey) {
    const walletPublicKeyObj = new PublicKey(walletPublicKey);
    let balancew = await connection.getBalance(walletPublicKeyObj);
    setWBalance(balancew/LAMPORTS_PER_SOL);
  }
};

  
  
  
  return (
    <div className="App">
      <header className="App-header">
        <img className='App-logo' src={img} alt='logo' width={"5%"} height={"5%"}/>
        <h1>Sol generator</h1>
        <h2>Account</h2>
        {!accountKeypair && (
          <button onClick={createSolanaAccount}>
            Create a new Solana account
          </button>
        )}
        {accountKeypair && (
          <div>
            <p>Account address: {accountKeypair.publicKey.toBase58()}</p>
            <p>Balance: {balance} SOL</p>
            <button onClick={airdrop2}>Airdrop</button>
          </div>
        )}
        <button onClick={getBalance}>balance</button>
      </header>
      <main>
      <h2>Wallet</h2>
        {!walletConnected && (
          <button onClick={connectToWallet}>Connect to Phantom Wallet</button>
        )}
        {walletConnected && <p>Phantom Wallet connected</p>}
        <p>Address : {walletPublicKey}</p>
        {!walletConnected && (
          <p>
            Phantom Wallet is not connected. Install{' '}
            <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer">
              Phantom Wallet extension
            </a>
          </p>
        )}
        <p>Balance: {balanceW} SOL</p>
        <button onClick={getWBalance}>balance</button>

        <h2>Transaction</h2>
        <form onSubmit={transferToWallet}>
          <label>amount : </label>
          <input id='amount' type='float'/>
          {accountKeypair && walletConnected && (
            <button type='submit'>Transfer to wallet</button>
          )}
        </form>
      </main>
      <footer>
        <p>Only on devnet</p>
      </footer>
    </div>
  );
}

export default App;
