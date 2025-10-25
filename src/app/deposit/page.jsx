"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import mtnLogo from "public/assets/mtn.svg";
import airtelLogo from "public/assets/airtel.svg";
import telecelLogo from "public/assets/telecel (1).svg";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const quickAmounts = [10, 20, 50, 100, 200];

  const providerMeta = {
    MTN: {
      label: "MTN MoMo",
      colorClass: "bg-yellow-400 text-black",
      logo: mtnLogo,
    },
    AirtelTigo: {
      label: "AirtelTigo Money",
      colorClass: "bg-red-600 text-white",
      logo: airtelLogo,
    },
    Telecel: {
      label: "Telecel Cash",
      colorClass: "bg-red-700 text-white",
      logo: telecelLogo,
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const amt = parseFloat(amount);
    if (!amt || amt < 10) {
      setError("Minimum deposit is GHS 10");
      return;
    }
    if (!/^\+?\d{9,15}$/.test(phone.replace(/\s|-/g, ""))) {
      setError("Enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to payment processor
      await new Promise((r) => setTimeout(r, 1200));
      setSuccess(
        "Payment prompt sent. Approve on your phone to complete deposit."
      );
      setAmount("");
    } catch (e) {
      setError("Failed to initiate deposit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-mobile min-h-screen py-6">
      <div className="mb-6">
        <Link
          href="/wallet"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Wallet
        </Link>
      </div>

      <div className="card-raid p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Deposit Funds</h1>
        <p className="text-gray-400 mb-6">
          Top up your wallet using Mobile Money.
        </p>

        {success && (
          <div className="bg-green-600/10 border border-green-600/30 text-green-400 rounded-lg p-3 mb-4 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-600/10 border border-red-600/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded overflow-hidden bg-gray-900 flex items-center justify-center">
                <Image
                  src={providerMeta[network]?.logo}
                  alt={`${network} logo`}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div
                className={`px-2 py-1 rounded text-xs font-semibold ${providerMeta[network]?.colorClass}`}
              >
                {providerMeta[network]?.label}
              </div>
            </div>
            <div className="text-xs text-gray-400">Min: GHS 10</div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Amount (GHS)
            </label>
            <input
              type="number"
              min="10"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 100"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              required
            />
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm"
                >
                  GHS {amt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Network
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                <option>MTN</option>
                <option>Telecel</option>
                <option>AirtelTigo</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +233 24 123 4567"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn-raid w-full ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Processing…" : "Deposit Now"}
          </button>
        </form>

        <div className="text-xs text-gray-500 mt-4">
          By proceeding you agree to pay any network charges. Deposits reflect
          instantly after approval.
        </div>
      </div>
    </div>
  );
}