"use client"

import { ccc } from "@ckb-ccc/ccc";
import { useCcc } from "@ckb-ccc/connector-react";
import ConnectWallet from "@/components/ConnectWallet";
import { useState } from "react";

export default function Home() {
  const { signerInfo } = useCcc();
  const signer = signerInfo?.signer;
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-md">
        <p className="text-2xl font-bold animate-bounce">
          CKB Transfer App with CCC
        </p>

        <div className="flex gap-4 items-center">
          <ConnectWallet />
        </div>

        {signer && (
          <div className="flex flex-col gap-4 w-full">
            <input
              type="text"
              placeholder="Recipient address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full dark:bg-black dark:border-white/20"
            />
            <input
              type="number"
              placeholder="Amount (CKB)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full dark:bg-black dark:border-white/20"
            />
            <button
              onClick={handleTransfer}
              disabled={loading || !toAddress || !amount}
              className="bg-cyan-600 text-white rounded-lg px-4 py-2 hover:bg-cyan-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send CKB"}
            </button>

            {txHash && (
              <p className="text-green-500 text-sm break-all">
                Transaction sent: {txHash}
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm break-all">
                 {error}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}