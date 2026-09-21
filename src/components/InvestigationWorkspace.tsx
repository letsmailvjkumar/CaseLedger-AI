import React, { useState } from 'react';
import { Account, Transaction, RiskRule, CaseStatus, CaseSnapshot } from '../types';
import { GovernedRulesEngine } from '../services/governedEngine';
import { ShieldAlert, CheckCircle2, UserCheck, AlertOctagon, Save, ArrowRight, Sparkles, Scale, Info, Check } from 'lucide-react';

interface InvestigationWorkspaceProps {
  account: Account;
  transactions: Transaction[];
  rules: RiskRule[];
  findingText: string;
  setFindingText: (text: string) => void;
  onSaveSnapshot: (snapshot: CaseSnapshot) => void;
  currentDisposition: CaseStatus;
  setCurrentDisposition: (disposition: CaseStatus) => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  account,
  transactions,
  rules,
  findingText,
  setFindingText,
  onSaveSnapshot,
  currentDisposition,
  setCurrentDisposition,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState(
    'Concur with Senior Analyst finding. Issue Priority RFI to Branch RM-402 desk for UBO declaration and third-party logistics freight contracts.'
  );

  const structuring = GovernedRulesEngine.analyzeStructuring(transactions);
  const passThrough = GovernedRulesEngine.analyzePassThrough(transactions);
  const entity = GovernedRulesEngine.analyzeEntityOverlap(account, [account]);
  const scoreData = GovernedRulesEngine.calculateTransparentRiskScore(structuring, passThrough, entity);

  const handleFreezeAndSave = () => {
    const newSnapshot = GovernedRulesEngine.generateCaseSnapshot(
      `CASE-2026-0007`,
      account,
      transactions,
      rules,
      findingText,
      `Reviewed and verified mitigating factor: DEV-MUM-8842 attributed to Branch RM-402 desk tablet under SOP 8.4.`,
      currentDisposition,
      reviewerNotes,
      'Sunil Mehta (Head of Financial Crime Compliance)'
    );

    onSaveSnapshot(newSnapshot);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-100">Investigation Finding & Reviewer Workspace</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Active Case: CASE-2026-0007
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Formulate explainable, evidence-grounded findings with human-in-the-loop sign-off.
          </p>
        </div>

        <button
          onClick={handleFreezeAndSave}
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
        >
          {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'Decision Frozen!' : 'Freeze & Save Snapshot'}</span>
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-4 flex-1 font-sans text-xs">
        {/* Transparent Mathematical Risk Score Matrix */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">Transparent Risk Scoring Breakdown</span>
            </div>
            <div className="font-mono text-base font-bold text-amber-400">
              Total Score: {scoreData.totalScore}/100
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scoreData.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80 flex items-start justify-between gap-2"
              >
                <div>
                  <span className="font-medium text-slate-200 block text-[11px]">{item.component}</span>
                  <span className="text-[10px] text-slate-400">{item.reason}</span>
                </div>
                <span
                  className={`font-mono font-bold text-xs shrink-0 ${
                    item.points > 0 ? 'text-amber-400' : item.points < 0 ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {item.points > 0 ? `+${item.points}` : item.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Finding Editor */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Investigator Finding Narrative</span>
              <span className="text-[10px] font-mono text-cyan-400 font-normal">
                (Grounds for STR or RFI)
              </span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Auto-syncs with Copilot responses
            </span>
          </div>

          <textarea
            value={findingText}
            onChange={(e) => setFindingText(e.target.value)}
            rows={6}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
            placeholder="Type or paste the official investigator finding here..."
          />
        </div>

        {/* Disposition Selector */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
          <label className="font-semibold text-slate-200 block">
            Select Regulatory Disposition & Next Action
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => setCurrentDisposition('RETURNED_RFI')}
              className={`p-3 rounded-lg border text-left transition-all ${
                currentDisposition === 'RETURNED_RFI'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold font-mono text-xs flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Return for Info (RFI)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Recommended: Query Branch RM-402 regarding desk tablet & request UBO declaration.
              </p>
            </button>

            <button
              onClick={() => setCurrentDisposition('ESCALATED_FIU')}
              className={`p-3 rounded-lg border text-left transition-all ${
                currentDisposition === 'ESCALATED_FIU'
                  ? 'bg-red-500/15 border-red-500 text-red-300 shadow-md shadow-red-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold font-mono text-xs flex items-center gap-1.5 mb-1">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                <span>Escalate STR to FIU</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Immediately submit Suspicious Transaction Report to Financial Intelligence Unit.
              </p>
            </button>

            <button
              onClick={() => setCurrentDisposition('CLOSED_FALSE_POSITIVE')}
              className={`p-3 rounded-lg border text-left transition-all ${
                currentDisposition === 'CLOSED_FALSE_POSITIVE'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold font-mono text-xs flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Close (False Positive)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Document seasonal turnover and branch assisted terminal; archive alert.
              </p>
            </button>
          </div>
        </div>

        {/* Reviewer Sign-Off Box */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <label className="font-semibold text-slate-200 block text-xs">
            Approving Reviewer Comments (Audit Log Entry)
          </label>
          <input
            type="text"
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
            <span>Reviewer: Sunil Mehta (MLRO)</span>
            <span>Policy Version: POL-2026.3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
