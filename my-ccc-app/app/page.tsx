"use client"

import { ccc } from "@ckb-ccc/ccc";
import { useCcc } from "@ckb-ccc/connector-react";
import ConnectWallet from "@/components/ConnectWallet";
import { useState, useEffect, useCallback } from "react";

interface TxRecord {
  hash: string;
  recipients: { address: string; amount: string }[];
  timestamp: number;
}

interface TokenBalance {
  name: string;
  amount: string;
  typeHash: string;
}

interface OnChainTx {
  hash: string;
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

  const [recipients, setRecipients] = useState([{ address: "", amount: "" }]);
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [onChainHistory, setOnChainHistory] = useState<OnChainTx[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"send" | "history" | "tokens">("send");

  const fetchBalance = useCallback(async () => {
    if (!signer) return;
    setBalanceLoading(true);
    try {
      const capacity = await signer.getBalance();
      const ckb = (Number(capacity) / 1e8).toFixed(4);
      setBalance(ckb);
    } catch {
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, [signer]);

  const fetchTokens = useCallback(async () => {
    if (!signer) return;
    try {
      const address = await signer.getRecommendedAddress();
      const { script: lock } = await ccc.Address.fromString(address, signer.client);
      const tokenMap = new Map<string, bigint>();

      for await (const cell of signer.client.findCells({
        script: lock,
        scriptType: "lock",
        scriptSearchMode: "prefix",
      })) {
        if (cell.cellOutput.type) {
          const typeHash = cell.cellOutput.type.hash();
          const data = cell.outputData;
          if (data && data.length >= 34) {
            const amount = ccc.numLeFromBytes(ccc.bytesFrom(data).slice(0, 16));
            const existing = tokenMap.get(typeHash) ?? 0n;
            tokenMap.set(typeHash, existing + amount);
          }
        }
      }

      const tokenList: TokenBalance[] = Array.from(tokenMap.entries()).map(([typeHash, amount]) => ({
        name: "UDT",
        amount: (Number(amount) / 1e8).toFixed(4),
        typeHash,
      }));

      setTokens(tokenList);
    } catch {
      setTokens([]);
    }
  }, [signer]);

  const fetchOnChainHistory = useCallback(async () => {
    if (!signer) return;
    setHistoryLoading(true);
    try {
      const address = await signer.getRecommendedAddress();
      const { script: lock } = await ccc.Address.fromString(address, signer.client);
      const txs: OnChainTx[] = [];

      for await (const tx of signer.client.findTransactions({
        script: lock,
        scriptType: "lock",
        scriptSearchMode: "prefix",
        groupByTransaction: true,
      })) {
        txs.push({
          hash: tx.txHash,
          timestamp: Date.now(),
        });
        if (txs.length >= 10) break;
      }

      setOnChainHistory(txs);
    } catch {
      setOnChainHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [signer]);

  useEffect(() => {
    fetchBalance();
    fetchTokens();
    fetchOnChainHistory();
  }, [fetchBalance, fetchTokens, fetchOnChainHistory]);

  function addRecipient() {
    setRecipients((prev) => [...prev, { address: "", amount: "" }]);
  }

  function removeRecipient(index: number) {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRecipient(index: number, field: "address" | "amount", value: string) {
    setRecipients((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  async function handleMint() {
  if (!signer) return;
  setLoading(true);
  setError("");
  try {
    const address = await signer.getRecommendedAddress();
    const { script: myLock } = await ccc.Address.fromString(address, signer.client);

    const tokenArgs = ccc.hashTypeId(
      { previousOutput: { txHash: "0x" + "0".repeat(64), index: 0 }, since: "0x0" },
      0
    );

    const type = await ccc.Script.fromKnownScript(
      signer.client,
      ccc.KnownScript.XUdt,
      tokenArgs
    );

    const mintAmount = ccc.fixedPointFrom(1000);

    const tx = ccc.Transaction.from({
      outputs: [{ lock: myLock, type }],
      outputsData: [ccc.numLeToBytes(mintAmount, 16)],
    });

    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer);
    const hash = await signer.sendTransaction(tx);
    console.log("Minted! TX:", hash);
    await fetchTokens();
  } catch (e: any) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
}

  const isFormValid = recipients.every((r) => r.address && r.amount);

  async function handleTransfer() {
    if (!signer) return;
    setLoading(true);
    setError("");
    setTxHash("");

    try {
      const outputs = await Promise.all(
        recipients.map(async (r) => {
          const { script: lock } = await ccc.Address.fromString(r.address, signer.client);
          return { capacity: ccc.fixedPointFrom(Number(r.amount)), lock };
        })
      );

      const tx = ccc.Transaction.from({ outputs });
      await tx.completeInputsByCapacity(signer);
      await tx.completeFeeBy(signer);
      const hash = await signer.sendTransaction(tx);

      setTxHash(hash);
      setTxHistory((prev) => [{
        hash,
        recipients: [...recipients],
        timestamp: Date.now(),
      }, ...prev]);

      setRecipients([{ address: "", amount: "" }]);
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

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-cyan-400">CKB Wallet</h1>
          <p className="text-gray-400 text-sm mt-1">Powered by CCC · Testnet</p>
        </div>

        <div className="flex justify-center">
          <ConnectWallet />
        </div>

        {signer && (
          <>
            {/* Balance Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Balance</p>
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
                className="text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-40 p-2 rounded-lg hover:bg-gray-800"
              >
                <svg
                  className={`w-5 h-5 ${balanceLoading ? "animate-spin" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
              {(["send", "history", "tokens"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-cyan-500 text-gray-950"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab === "history" ? "History" : tab === "tokens" ? "Tokens" : "Send"}
                </button>
              ))}
            </div>

            {/* Send Tab */}
            {activeTab === "send" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">Send CKB</h2>

                {recipients.map((recipient, index) => (
                  <div key={index} className="flex flex-col gap-2 border border-gray-800 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Recipient {index + 1}</span>
                      {recipients.length > 1 && (
                        <button onClick={() => removeRecipient(index)} className="text-red-400 hover:text-red-300 text-xs">
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Recipient address (ckt1...)"
                      value={recipient.address}
                      onChange={(e) => updateRecipient(index, "address", e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors w-full"
                    />
                    <input
                      type="number"
                      placeholder="Amount in CKB"
                      value={recipient.amount}
                      onChange={(e) => updateRecipient(index, "amount", e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors w-full"
                    />
                  </div>
                ))}

                <button onClick={addRecipient} className="text-cyan-500 hover:text-cyan-400 text-sm text-left transition-colors">
                  + Add another recipient
                </button>

                <button
                  onClick={handleTransfer}
                  disabled={loading || !isFormValid}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
                >
                  {loading ? "Sending..." : recipients.length > 1 ? `Send to ${recipients.length} recipients →` : "Send CKB →"}
                </button>

                {txHash && (
                  <div className="flex items-center gap-2 bg-green-950 border border-green-800 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <a
                      href={`https://pudge.explorer.nervos.org/transaction/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 text-xs break-all font-mono hover:underline"
                    >
                      {txHash}
                    </a>
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
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 uppercase tracking-widest">On-chain history</p>
                  <button
                    onClick={fetchOnChainHistory}
                    disabled={historyLoading}
                    className="text-cyan-500 text-xs hover:text-cyan-400 disabled:opacity-40"
                  >
                    {historyLoading ? "Loading..." : "↻ Refresh"}
                  </button>
                </div>

                {historyLoading ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                    <p className="text-gray-500 text-sm">Loading transactions...</p>
                  </div>
                ) : onChainHistory.length === 0 ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                    <p className="text-gray-500 text-sm">No transactions found</p>
                  </div>
                ) : (
                  onChainHistory.map((tx) => (
                    <div key={tx.hash} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-cyan-900 text-cyan-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Transaction
                        </span>
                        <span className="text-gray-500 text-xs">{formatTime(tx.timestamp)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <span className="text-gray-600 font-mono text-xs truncate max-w-[200px]">
                          {tx.hash.slice(0, 18)}…
                        </span>
                        <a
                          href={`https://pudge.explorer.nervos.org/transaction/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-500 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors"
                        >
                          View on explorer
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tokens Tab */}
            {activeTab === "tokens" && (
  <div className="flex flex-col gap-3">
    <button
      onClick={handleMint}
      disabled={loading}
      className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-gray-950 font-semibold rounded-xl px-4 py-3 text-sm transition-colors w-full"
    >
      {loading ? "Minting..." : "Mint 1000 Test Tokens"}
    </button>

    {tokens.length === 0 ? (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <p className="text-gray-500 text-sm">No tokens found in this wallet</p>
      </div>
    ) : (
      tokens.map((token) => (
        <div key={token.typeHash} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-white font-semibold text-sm">{token.name}</span>
            <span className="text-gray-500 text-xs font-mono">{truncateAddress(token.typeHash)}</span>
          </div>
          <span className="text-cyan-400 font-bold">{formatCKB(token.amount)}</span>
        </div>
      ))
    )}
  </div>
)}
          </>
        )}
      </div>
    </div>
  );
}