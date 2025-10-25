"use client";

import { useState } from "react";
import Image from "next/image";
import mtnLogo from "public/assets/mtn.svg";
import airtelLogo from "public/assets/airtel.svg";
import telecelLogo from "public/assets/telecel (1).svg";

export default function WalletPage() {
  const [balance, setBalance] = useState(2500);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawalNumber, setWithdrawalNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  const transactions = [
    {
      id: "1",
      type: "win",
      amount: 3600,
      description: "PUBG Mobile Championship - 3rd Place",
      date: "2024-08-25T14:30:00Z",
      status: "completed",
    },
    {
      id: "2",
      type: "entry",
      amount: -120,
      description: "Call of Duty Mobile Showdown - Entry Fee",
      date: "2024-08-24T18:00:00Z",
      status: "completed",
    },
    {
      id: "3",
      type: "deposit",
      amount: 240,
      description: "Mobile Money Deposit (MTN MoMo)",
      date: "2024-08-23T10:15:00Z",
      status: "completed",
    },
    {
      id: "4",
      type: "withdrawal",
      amount: -2880,
      description: "Withdrawal to MTN MoMo",
      date: "2024-08-22T16:45:00Z",
      status: "completed",
    },
  ];

  const formatCurrency = (amount) => `GHS ${Math.abs(amount).toLocaleString()}`;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "win":
        return "text-green-400";
      case "deposit":
        return "text-blue-400";
      case "entry":
        return "text-orange-400";
      case "withdrawal":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="container-mobile min-h-screen py-6">
      {/* Wallet Balance Card */}
      <div className="card-raid p-6 mb-6 text-center glow-orange">
        <h1 className="text-xl font-bold text-white mb-2">Wallet Balance</h1>
        <div className="text-4xl font-bold text-raid-gradient mb-4">
          {formatCurrency(balance)}
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Available for tournaments and withdrawals
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setShowAddFunds(true)} className="btn-raid">
            Deposit Funds
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="btn-raid-outline"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card-raid p-4">
          <h3 className="font-semibold text-white">Total Winnings</h3>
          <p className="text-green-400 font-bold text-lg">GHS 10,800</p>
          <p className="text-gray-400 text-sm">This month</p>
        </div>
        <div className="card-raid p-4">
          <h3 className="font-semibold text-white">Tournaments</h3>
          <p className="text-blue-400 font-bold text-lg">12</p>
          <p className="text-gray-400 text-sm">Entered</p>
        </div>
      </div>

      {/* Mobile Money Integration */}
      <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-600/30 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-white mb-2">
          Mobile Money Integration
        </h3>
        <p className="text-gray-300 text-sm mb-2">
          Instant deposits and withdrawals via:
        </p>
        <div className="flex space-x-6 items-center">
          <Provider name="MTN" color="text-yellow-500" logo={mtnLogo} />
          <Provider name="Telecel" color="text-red-500" logo={telecelLogo} />
          <Provider
            name="AirtelTigo"
            color="text-blue-500"
            logo={airtelLogo}
          />
        </div>
      </div>

      {/* Transaction History */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Recent Transactions
        </h2>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="card-raid p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {transaction.description}
                  </h4>
                  <p className="text-gray-400 text-xs">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${getTransactionColor(
                      transaction.type
                    )}`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <span className="text-green-500 text-xs">✓ Completed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <AddFundsModal onClose={() => setShowAddFunds(false)} />
      )}
    </div>
  );
}

/* Subcomponent: MoMo Provider */
function Provider({ name, color, logo }) {
  return (
    <div className="flex items-center space-x-2">
      <Image src={logo} alt={name} width={24} height={24} className="w-6 h-6" />
      <span className={`${color} font-semibold`}>{name}</span>
    </div>
  );
}

/* Subcomponent: Add Funds Modal */
function AddFundsModal({ onClose }) {
  const providers = [
    { name: "MTN Mobile Money", color: "bg-yellow-600", logo: mtnLogo },
    { name: "Telecel Cash", color: "bg-red-600", logo: telecelLogo },
    { name: "AirtelTigo Money", color: "bg-blue-600", logo: airtelLogo },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card-raid p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold text-white mb-4">Add Funds</h3>
        <p className="text-gray-300 mb-4">
          Select your preferred Mobile Money provider:
        </p>

        <div className="space-y-3 mb-6">
          {providers.map((provider) => (
            <button
              key={provider.name}
              className={`w-full ${provider.color} hover:opacity-90 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2`}
            >
              <Image
                src={provider.logo}
                alt={provider.name}
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span>{provider.name}</span>
            </button>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
          >
            Cancel
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
