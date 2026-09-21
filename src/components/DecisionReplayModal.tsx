import React, { useState } from 'react';
import { CaseSnapshot } from '../types';
import { History, ShieldCheck, CheckCircle2, FileCode, Play, RotateCcw, ArrowRight, UserCheck, Scale, Download, Lock } from 'lucide-react';

interface DecisionReplayModalProps {
  snapshot: CaseSnapshot;
  onClose: () => void;
}

export const DecisionReplayModal: React.FC<DecisionReplayModalProps> = ({
  snapshot,
  onClose,
}) => {
  const [replayStep, setReplayStep] = useState<number>(4); // 0 to 4 steps
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      id: 0,
      title: '1. Ingestion & Data Freeze',
      time: '14:30:02 UTC',
      desc: 'Transactions and account profile frozen into immutable snapshot.',
    },
    {
      id: 1,
      title: '2. Deterministic Rule Execution',
      time: '14:30:05 UTC',
      desc: 'Engine v2.4.1 executed Structuring & Pass-Through calculations.',
    },
    {
      id: 2,
      title: '3. AI Initial Draft Generated',
      time: '14:30:12 UTC',
      desc: 'Copilot synthesized raw signal and recommended immediate STR.',
    },
    {
      id: 3,
      title: '4. Analyst Human Investigation',
      time: '15:10:00 UTC',
      desc: 'Analyst identified Branch RM-402 tablet defense and GST counterparty.',
    },
    {
      id: 4,
      title: '5. Reviewer Sign-Off & Disposition',
      time: '16:45:00 UTC',
      desc: 'Compliance Head approved RFI disposition; sealed decision record.',
    },
  ];

  const handlePlayReplay = () => {
    setIsPlaying(true);
    setReplayStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step <= 4) {
        setReplayStep(step);
      } else {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 1200);
  };

  const handleExportManifest = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CaseLedger_Snapshot_${snapshot.caseId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Decision Replay: Case {snapshot.caseId}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Tamper-Evident Immutable Record</span>
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Checksum: {snapshot.dataFreezeChecksum}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportManifest}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Manifest</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Replay Control Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayReplay}
              disabled={isPlaying}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isPlaying ? 'Replaying...' : 'Replay Timeline'}</span>
            </button>
            <button
              onClick={() => setReplayStep(4)}
              className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium rounded hover:bg-slate-800 transition-colors"
            >
              Jump to Final State
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setReplayStep(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                  replayStep === s.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : replayStep > s.id
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    replayStep === s.id
                      ? 'bg-cyan-400 animate-ping'
                      : replayStep > s.id
                      ? 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                />
                <span className="hidden sm:inline font-mono">{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step Narrative Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                Replay Step {replayStep + 1} of 5 • {steps[replayStep].time}
              </div>
              <h4 className="text-sm font-bold text-slate-100">{steps[replayStep].title}</h4>
              <p className="text-xs text-slate-300 mt-1">{steps[replayStep].desc}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono text-slate-400 block">Corpus Versions</span>
              <span className="text-xs font-mono text-cyan-300 block">
                {snapshot.ruleEngineVersion} • {snapshot.policyCorpusVersion}
              </span>
            </div>
          </div>

          {/* Stage Visualizations */}
          {replayStep === 0 && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Frozen Snapshot Data Boundary
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Subject Account</span>
                  <span className="font-mono text-cyan-300 font-semibold">{snapshot.subjectAccountId}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Window Start</span>
                  <span className="font-mono text-slate-200">12 Sep 2026</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Window End</span>
                  <span className="font-mono text-slate-200">18 Sep 2026</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Evidence Completeness</span>
                  <span className="font-mono text-emerald-400 font-semibold">92%</span>
                </div>
              </div>
            </div>
          )}

          {replayStep === 1 && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Deterministic Rule Calculation Output
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Sub-Threshold Deposits</span>
                  <span className="font-mono text-amber-300 text-lg font-bold">
                    {snapshot.calculatedMetrics.subThresholdDepositCount} of 8
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Value: ₹{(snapshot.calculatedMetrics.totalCreditsInWindow / 100000).toFixed(1)}L
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Pass-Through Outflow Ratio</span>
                  <span className="font-mono text-red-400 text-lg font-bold">
                    {(snapshot.calculatedMetrics.passThroughRatio * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Hold duration: {snapshot.calculatedMetrics.turnaroundHours} hours
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Hardware Entity Overlap</span>
                  <span className="font-mono text-purple-300 text-lg font-bold">
                    {snapshot.calculatedMetrics.sharedDeviceCount} Accounts
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Device ID: DEV-MUM-8842
                  </span>
                </div>
              </div>
            </div>
          )}

          {(replayStep === 2 || replayStep >= 3) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Comparative Analysis: Initial AI Draft vs. Analyst Finding
                </h5>
                <span className="text-xs text-cyan-400 font-mono">
                  Human-in-the-Loop Discrepancy Analysis
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Draft */}
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Original Automated AI Draft</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Auto-Generated</span>
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono bg-slate-900/50 p-3 rounded-lg">
                    {snapshot.originalAiDraft}
                  </div>
                  <div className="mt-2 text-[11px] text-amber-400/90 font-medium">
                    ⚠️ Limitation: Assumed shared device was a criminal mule syndicate without branch context.
                  </div>
                </div>

                {/* Analyst Modifications */}
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Analyst Refinement (Priya Nair)</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Verified Defense</span>
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono bg-slate-900/50 p-3 rounded-lg">
                    {snapshot.analystEdits}
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-400/90 font-medium">
                    ✓ Mitigating Factor: Attributed DEV-MUM-8842 to Fort Branch RM-402 desk tablet under SOP 8.4.
                  </div>
                </div>
              </div>
            </div>
          )}

          {replayStep === 4 && (
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span>Final Reviewer Decision & Audit Trail</span>
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  Disposition: {snapshot.reviewerDisposition.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg font-sans">
                <strong>Reviewer Rationale:</strong> {snapshot.reviewerNotes}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-400 pt-1">
                <div>Sign-off Authority: <span className="text-slate-200">{snapshot.reviewerId}</span></div>
                <div>Recorded At: <span className="text-slate-200">{new Date(snapshot.signedOffAt).toLocaleString()}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
