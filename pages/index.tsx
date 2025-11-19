import { useState, useEffect } from 'react';
// импортируем без типов
import TronWeb from 'tronweb';

export default function Home() {
  const [tronWeb, setTronWeb] = useState<any>(null); // any вместо TronWeb
  const [wallet, setWallet] = useState<any>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const initTron = async () => {
      const tw = new TronWeb({
        fullHost: process.env.NEXT_PUBLIC_TRON_HOST || 'https://api.shasta.trongrid.io'
      });
      setTronWeb(tw);
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
  };

  const sendTRX = async (to: string, amountTRX: number) => {
    if (!tronWeb || !wallet) return;
    try {
      const trade = await tronWeb.trx.sendTransaction(
        to,
        amountTRX * 1_000_000,
        wallet.address.base58
      );
      alert('Tx ID: ' + trade.txid);
    } catch (err) {
      alert('Error sending TRX: ' + err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>TRON Wallet</h1>
      <button onClick={createWallet}>Create Wallet</button>

      {wallet && (
        <div style={{ marginTop: '1rem' }}>
          <p><strong>Address:</strong> {wallet.address.base58}</p>
          <p><strong>Private Key:</strong> {wallet.privateKey}</p>
          <p><strong>Balance:</strong> {balance} TRX</p>
        </div>
      )}

      {wallet && (
        <div style={{ marginTop: '1rem' }}>
          <input id="to" placeholder="Receiver Address" />
          <input id="amount" placeholder="Amount TRX" type="number" />
          <button
            onClick={() =>
              sendTRX(
                (document.getElementById('to') as HTMLInputElement).value,
                parseFloat(
                  (document.getElementById('amount') as HTMLInputElement).value
                )
              )
            }
          >
            Send TRX
          </button>
        </div>
      )}
    </div>
  );
}