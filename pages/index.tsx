import { useState, useEffect } from 'react';
import TronWeb from 'tronweb';
import { Player } from '@lottiefiles/react-lottie-player';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function Home() {
  const [tronWeb, setTronWeb] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const initTron = async () => {
      const tw = new TronWeb({
        fullHost: process.env.NEXT_PUBLIC_TRON_HOST || 'https://api.shasta.trongrid.io'
      });
      setTronWeb(tw);

      const stored = localStorage.getItem('tronWallet');
      if (stored) {
        const w = JSON.parse(stored);
        setWallet(w);
        const bal = await tw.trx.getBalance(w.address.base58);
        setBalance(bal / 1_000_000);
      }
    };
    initTron();
  }, []);

  const createWallet = async () => {
    if (!tronWeb) return;
    const account = await tronWeb.createAccount();
    setWallet(account);
    localStorage.setItem('tronWallet', JSON.stringify(account));
    const bal = await tronWeb.trx.getBalance(account.address.base58);
    setBalance(bal / 1_000_000);

    // Конфетти при создании кошелька
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const sendTRX = async () => {
    if (!tronWeb || !wallet) return;
    try {
      const trade = await tronWeb.trx.sendTransaction(
        to,
        parseFloat(amount) * 1_000_000,
        wallet.address.base58
      );
      alert('Tx ID: ' + trade.txid);
      setAmount('');
      setTo('');
    } catch (err) {
      alert('Error sending TRX: ' + err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 flex flex-col items-center justify-center p-4 text-white">
      <motion.h1
        className="text-4xl font-bold mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        TRON Wallet
      </motion.h1>

      <Player
        autoplay
        loop
        src="https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json"
        style={{ height: 200, width: 200 }}
      />

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={createWallet}
        className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg mt-6 shadow-lg"
      >
        Create Wallet
      </motion.button>

      {wallet && (
        <motion.div
          className="bg-white text-black rounded-xl p-6 mt-6 w-full max-w-md shadow-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p><strong>Address:</strong> {wallet.address.base58}</p>
          <p><strong>Private Key:</strong> {wallet.privateKey}</p>
          <p><strong>Balance:</strong> {balance} TRX</p>
        </motion.div>
      )}

      {wallet && (
        <motion.div
          className="bg-white text-black rounded-xl p-6 mt-6 w-full max-w-md shadow-xl flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <input
            placeholder="Receiver Address"
            className="p-3 border rounded-lg"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <input
            placeholder="Amount TRX"
            type="number"
            className="p-3 border rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendTRX}
            className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
          >
            Send TRX
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}