import React, { useState } from 'react';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, AlertTriangle, ShieldCheck, Filter, Search } from 'lucide-react';

interface TransactionLedgerProps {
  transactions: Transaction[];
  selectedTxnId?: string | null;
  onSelectTxn?: (txn: Transaction) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  selectedTxnId,
  onSelectTxn,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'FLAGGED' | 'CREDIT' | 'DEBIT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((t) => {
    if (filterType === 'FLAGGED' && !t.isFlagged) return false;
    if (filterType === 'CREDIT' && t.type !== 'CREDIT') return false;
    if (filterType === 'DEBIT' && t.type !== 'DEBIT') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.counterpartyName.toLowerCase().includes(q) ||
        t.channel.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Search & Filter Header */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">Forensic Transaction Ledger</span>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {filtered.length} of {transactions.length} Records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search TXN, counterparty, channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 font-sans"
            />
          </div>

          <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded transition-all ${
                filterType === 'ALL' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('FLAGGED')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                filterType === 'FLAGGED' ? 'bg-amber-500/20 text-amber-300' : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Flagged ({transactions.filter((t) => t.isFlagged).length})</span>
            </button>
            <button
              onClick={() => setFilterType('CREDIT')}
              className={`px-2.5 py-1 rounded transition-all ${
                filterType === 'CREDIT' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Credits
            </button>
            <button
              onClick={() => setFilterType('DEBIT')}
              className={`px-2.5 py-1 rounded transition-all ${
                filterType === 'DEBIT' ? 'bg-red-500/20 text-red-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Debits
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs text-slate-300 font-sans">
          <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800 sticky top-0">
            <tr>
              <th className="py-2.5 px-3">TXN ID & Time</th>
              <th className="py-2.5 px-3">Type & Channel</th>
              <th className="py-2.5 px-3">Counterparty</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3">CTR Proximity</th>
              <th className="py-2.5 px-3">Risk Assessment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.map((txn) => {
              const isSelected = selectedTxnId === txn.id;

              return (
                <tr
                  key={txn.id}
                  onClick={() => onSelectTxn && onSelectTxn(txn)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono">
                    <div className="font-semibold text-slate-200">{txn.id}</div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(txn.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {txn.type === 'CREDIT' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span className="font-mono text-[11px] text-slate-300">
                        {txn.channel.replace('_', ' ')}
                      </span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="text-slate-200 font-medium">{txn.counterpartyName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{txn.counterpartyAccount}</div>
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-semibold">
                    <span className={txn.type === 'CREDIT' ? 'text-emerald-400' : 'text-slate-100'}>
                      {txn.type === 'CREDIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </td>

                  <td className="py-2.5 px-3">
                    {txn.thresholdProximity ? (
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${txn.thresholdProximity * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-amber-300">
                          {(txn.thresholdProximity * 100).toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">N/A</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    {txn.isFlagged ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{txn.flagReason || 'Triggered AML Rule'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{txn.flagReason || 'Compliant'}</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
