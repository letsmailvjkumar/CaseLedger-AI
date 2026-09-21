import React from 'react';
import { Account } from '../types';
import { ShieldCheck, History, FileText, Box, Layers, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentAccount: Account;
  accounts: Account[];
  onSelectAccount: (acc: Account) => void;
  activeView: '3D_EXPLORER' | 'EVIDENCE' | 'LEDGER';
  setActiveView: (view: '3D_EXPLORER' | 'EVIDENCE' | 'LEDGER') => void;
  onOpenReplay: () => void;
  onOpenAuditReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAccount,
  accounts,
  onSelectAccount,
  activeView,
  setActiveView,
  onOpenReplay,
  onOpenAuditReport,
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none sticky top-0 z-30">
      {/* Brand & Active Case */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
            CL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white font-mono">
                CaseLedger<span className="text-cyan-400">.AI</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                v2.4 Governed
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Evidence-Backed AML Investigation & Decision Replay
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block" />

        {/* Account Selector Pill */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 transition-colors">
            <span
              className={`w-2 h-2 rounded-full ${
                currentAccount.riskLevel === 'HIGH'
                  ? 'bg-amber-400 animate-pulse'
                  : currentAccount.riskLevel === 'CRITICAL'
                  ? 'bg-red-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-semibold text-cyan-300">{currentAccount.id}</span>
            <span className="text-slate-400 max-w-[140px] truncate hidden sm:inline">
              {currentAccount.holderName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Dropdown Menu */}
          <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-800 mb-1">
              Select Investigation Target
            </div>
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onSelectAccount(acc)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                  currentAccount.id === acc.id ? 'bg-cyan-500/10 text-cyan-300 font-semibold' : 'text-slate-300'
                }`}
              >
                <div className="truncate">
                  <div className="font-mono">{acc.id}</div>
                  <div className="text-[11px] text-slate-400 truncate">{acc.holderName}</div>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 ml-2 ${
                    acc.riskLevel === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-400'
                      : acc.riskLevel === 'LOW'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {acc.riskLevel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Triage Metrics (Triage Telemetry) */}
      <div className="hidden lg:flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-3.5 py-1 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Risk Score:</span>
          <span className="font-bold text-amber-400">{currentAccount.riskScore}/100</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Evidence Completeness:</span>
          <span className="font-bold text-emerald-400">{currentAccount.evidenceCompleteness}%</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Signals:</span>
          <span className="font-bold text-cyan-400">{currentAccount.primarySignals.length} Active</span>
        </div>
      </div>

      {/* Navigation View Switcher & Action Modals */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveView('3D_EXPLORER')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === '3D_EXPLORER'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Topology</span>
          </button>
          <button
            onClick={() => setActiveView('EVIDENCE')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === 'EVIDENCE'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Evidence Matrix</span>
          </button>
          <button
            onClick={() => setActiveView('LEDGER')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === 'LEDGER'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ledger</span>
          </button>
        </div>

        {/* The Replay Button */}
        <button
          onClick={onOpenReplay}
          className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          title="Reconstruct historical decision state"
        >
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Decision Replay</span>
        </button>

        {/* Regulatory Finding Draft */}
        <button
          onClick={onOpenAuditReport}
          className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Draft Finding</span>
        </button>
      </div>
    </header>
  );
};
