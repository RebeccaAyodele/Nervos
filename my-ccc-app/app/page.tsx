"use client"

import { ccc } from "@ckb-ccc/ccc";
import { useCcc } from "@ckb-ccc/connector-react";
import ConnectWallet from "@/components/ConnectWallet";
import { useState, useEffect, useCallback } from "react";

interface TxRecord {
  hash: string;
  toAddress: string;
  amount: string;
  timestamp: number;
}

function truncateAddress(addr: string) {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
}

function formatCKB(amount: string) {
  const n = parseFloat(amount);
  if (isNaN(n)) return amount;
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function formatTime(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export default function Home() {
  const { signerInfo } = useCcc();
  const signer = signerInfo?.signer;

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!signer) return;
    setBalanceLoading(true);
    try {
      const capacity = await signer.getBalance();
      // capacity is in shannons (1 CKB = 10^8 shannons)
      const ckb = (Number(capacity) / 1e8).toFixed(4);
      setBalance(ckb);
    } catch {
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, [signer]);

  // Fetch balance when signer connects
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  async function handleTransfer() {
    if (!signer) return;
    setLoading(true);
    setError("");
    setTxHash("");

    try {
      const { script: lock } = await ccc.Address.fromString(toAddress, signer.client);

      const tx = ccc.Transaction.from({
        outputs: [{ capacity: ccc.fixedPointFrom(Number(amount)), lock }],
      });

      await tx.completeInputsByCapacity(signer);
      await tx.completeFeeBy(signer);
      const hash = await signer.sendTransaction(tx);
      setTxHash(hash);
      setTxHistory((prev) => [
        {
          hash,
          toAddress,
          amount,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
      // Refresh balance after sending
      await fetchBalance();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-cyan-400">
            CKB Wallet
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Powered by CCC · Testnet
          </p>
        </div>

        {/* Connect Wallet */}
        <div className="flex justify-center">
          <ConnectWallet />
        </div>

        {signer && (
          <>
            {/* Balance Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                  Balance
                </p>
                {balance !== null ? (
                  <p className="text-3xl font-bold text-white">
                    {formatCKB(balance)}
                    <span className="text-base text-gray-400 ml-2 font-normal">CKB</span>
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">Unavailable</p>
                )}
              </div>
              <button
                onClick={fetchBalance}
                disabled={balanceLoading}
                title="Refresh balance"
                className="text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-40 p-2 rounded-lg hover:bg-gray-800"
              >
                <svg
                  className={`w-5 h-5 ${balanceLoading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Send Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
                Send CKB
              </h2>
              <input
                type="text"
                placeholder="Recipient address (ckt1...)"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors w-full"
              />
              <input
                type="number"
                placeholder="Amount in CKB"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors w-full"
              />
              <button
                onClick={handleTransfer}
                disabled={loading || !toAddress || !amount}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
              >
                {loading ? "Sending..." : "Send CKB →"}
              </button>

              {txHash && (
                <div className="flex items-center gap-2 bg-green-950 border border-green-800 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-400 text-xs break-all font-mono">{txHash}</p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-red-950 border border-red-800 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-xs break-all">{error}</p>
                </div>
              )}
            </div>

            {/* Transaction History */}
            {txHistory.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                  Session history
                </h2>
                {txHistory.map((tx) => (
                  <div
                    key={tx.hash}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3"
                  >
                    {/* Row 1: amount + timestamp */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-cyan-900 text-cyan-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Sent
                        </span>
                        <span className="text-white font-semibold text-sm">
                          {formatCKB(tx.amount)} CKB
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {formatTime(tx.timestamp)}
                      </span>
                    </div>

                    {/* Row 2: recipient */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">To</span>
                      <span className="text-gray-300 text-xs font-mono">
                        {truncateAddress(tx.toAddress)}
                      </span>
                    </div>

                    {/* Row 3: tx hash + explorer link */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      <span className="text-gray-600 font-mono text-xs truncate max-w-[200px]">
                        {tx.hash.slice(0, 18)}…
                      </span>
                      <a
                        href={`https://pudge.explorer.nervos.org/transaction/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-500 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors flex-shrink-0"
                      >
                        View on explorer
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}