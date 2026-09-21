import React, { useState } from 'react';
import {
  primaryAccount,
  relatedAccounts,
  sampleTransactions,
  riskRules,
  policyCitations,
  evidenceMatrix,
  defaultCaseSnapshot,
  network3DNodes,
  network3DLinks,
} from './data/mockData';
import { Account, CaseSnapshot, CaseStatus, Transaction } from './types';
import { Header } from './components/Header';
import { NetworkGraph3D } from './components/NetworkGraph3D';
import { EvidenceMatrix } from './components/EvidenceMatrix';
import { TransactionLedger } from './components/TransactionLedger';
import { CopilotDrawer } from './components/CopilotDrawer';
import { InvestigationWorkspace } from './components/InvestigationWorkspace';
import { DecisionReplayModal } from './components/DecisionReplayModal';
import { AuditReportModal } from './components/AuditReportModal';
import { CoCoTerminalModal } from './components/CoCoTerminalModal';
import { Sparkles, ShieldCheck, Scale, History, ArrowRight, Eye, RefreshCw, Terminal } from 'lucide-react';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState<Account>(primaryAccount);
  const [activeView, setActiveView] = useState<'3D_EXPLORER' | 'EVIDENCE' | 'LEDGER'>('3D_EXPLORER');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('ACC-1042');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [isAuditReportOpen, setIsAuditReportOpen] = useState(false);
  const [isCoCoOpen, setIsCoCoOpen] = useState(false);

  const [pinnedEvidenceIds, setPinnedEvidenceIds] = useState<string[]>([
    'EVD-01',
    'EVD-02',
    'EVD-03',
    'EVD-04',
    'EVD-05',
  ]);

  const [currentDisposition, setCurrentDisposition] = useState<CaseStatus>('RETURNED_RFI');
  const [currentSnapshot, setCurrentSnapshot] = useState<CaseSnapshot>(defaultCaseSnapshot);

  const [findingText, setFindingText] = useState<string>(
    `INVESTIGATION FINDING: ACC-1042 (Rohit Sharma Traders Pvt Ltd)
1. Structuring Signal Corroborated: 8 deposits totaling ₹74.20 Lakh in 5 days calibrated in 87-98% proximity to statutory ₹10L CTR threshold.
2. Rapid Pass-Through Outflow: ₹64.80 Lakh (87.4%) transferred out within 3.2 hours.
3. Mitigating Factor Established: Hardware ID DEV-MUM-8842 belongs to Fort Branch RM-402 desk tablet under SOP 8.4; verified ₹11.30L transfer to Apex Hardware as legitimate GST commercial settlement.
4. Disposition: Return for Information (RFI) to Branch RM-402 for UBO verification and freight bills for remaining ₹53.50L outflows.`
  );

  const handleToggleEvidencePinned = (id: string) => {
    setPinnedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAccount = (acc: Account) => {
    setCurrentAccount(acc);
    setSelectedNodeId(acc.id);
  };

  const handleNodeSelectFrom3D = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const foundAcc = relatedAccounts.find((a) => a.id === nodeId);
    if (foundAcc) {
      setCurrentAccount(foundAcc);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Application Header */}
      <Header
        currentAccount={currentAccount}
        accounts={relatedAccounts}
        onSelectAccount={handleSelectAccount}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenReplay={() => setIsReplayOpen(true)}
        onOpenAuditReport={() => setIsAuditReportOpen(true)}
        onOpenCoCoTerminal={() => setIsCoCoOpen(true)}
      />

      {/* Guided Walkthrough Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            SNOWFLAKE COCO CLI
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Workshop 1 & Workshop 2 Certified AI Toolchain:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCoCoOpen(true)}
            className="px-2.5 py-1 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 flex items-center gap-1.5 transition-colors font-mono font-semibold text-[11px]"
          >
            <Terminal className="w-3 h-3" />
            <span>Launch CoCo CLI</span>
          </button>
          <button
            onClick={() => {
              handleSelectAccount(primaryAccount);
              setActiveView('3D_EXPLORER');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1 transition-colors text-[11px]"
          >
            <span>1. 3D Fund Flow Topology</span>
          </button>
          <button
            onClick={() => setActiveView('EVIDENCE')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 flex items-center gap-1 transition-colors text-[11px]"
          >
            <span>2. Inspect Mitigating Evidence</span>
          </button>
          <button
            onClick={() => setIsReplayOpen(true)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1 transition-colors text-[11px]"
          >
            <History className="w-3 h-3 text-amber-400" />
            <span>3. Replay Decision</span>
          </button>
          <button
            onClick={() => setIsAuditReportOpen(true)}
            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1 transition-colors text-[11px]"
          >
            <span>4. Generate STR / RFI</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <main className="flex-1 p-4 grid grid-cols-1 xl:grid-cols-12 gap-4 max-w-[1800px] w-full mx-auto overflow-hidden">
        {/* Left/Center Visual Canvas & Investigation View (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col h-[740px] xl:h-[calc(100vh-140px)] min-h-[500px]">
          {activeView === '3D_EXPLORER' && (
            <div className="flex-1 h-full">
              <NetworkGraph3D
                nodes={network3DNodes}
                links={network3DLinks}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleNodeSelectFrom3D}
                activeFilter="ALL"
              />
            </div>
          )}

          {activeView === 'EVIDENCE' && (
            <div className="flex-1 h-full">
              <EvidenceMatrix
                evidenceItems={evidenceMatrix}
                policies={policyCitations}
                pinnedIds={pinnedEvidenceIds}
                onToggleEvidencePinned={handleToggleEvidencePinned}
              />
            </div>
          )}

          {activeView === 'LEDGER' && (
            <div className="flex-1 h-full">
              <TransactionLedger
                transactions={sampleTransactions}
                selectedTxnId={selectedTxn?.id}
                onSelectTxn={setSelectedTxn}
              />
            </div>
          )}
        </div>

        {/* Right Split: Governed Copilot & Finding Workspace (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4 h-[740px] xl:h-[calc(100vh-140px)] min-h-[500px]">
          {/* Top Half: Governed Copilot */}
          <div className="flex-1 min-h-[300px]">
            <CopilotDrawer
              currentAccount={currentAccount}
              transactions={sampleTransactions}
              onApplyDraftToFinding={(draft) => setFindingText(draft)}
            />
          </div>

          {/* Bottom Half: Finding Builder & Disposition Sign-Off */}
          <div className="flex-1 min-h-[300px]">
            <InvestigationWorkspace
              account={currentAccount}
              transactions={sampleTransactions}
              rules={riskRules}
              findingText={findingText}
              setFindingText={setFindingText}
              currentDisposition={currentDisposition}
              setCurrentDisposition={setCurrentDisposition}
              onSaveSnapshot={(snapshot) => {
                setCurrentSnapshot(snapshot);
              }}
            />
          </div>
        </div>
      </main>

      {/* Decision Replay Modal */}
      {isReplayOpen && (
        <DecisionReplayModal
          snapshot={currentSnapshot}
          onClose={() => setIsReplayOpen(false)}
        />
      )}

      {/* Audit-Ready Regulatory Report Modal */}
      {isAuditReportOpen && (
        <AuditReportModal
          account={currentAccount}
          transactions={sampleTransactions}
          rules={riskRules}
          evidence={evidenceMatrix.filter((e) => pinnedEvidenceIds.includes(e.id))}
          policies={policyCitations}
          analystFindingText={findingText}
          onClose={() => setIsAuditReportOpen(false)}
        />
      )}

      {/* Snowflake CoCo CLI Console Modal */}
      <CoCoTerminalModal
        isOpen={isCoCoOpen}
        onClose={() => setIsCoCoOpen(false)}
        onCommandRun={(cmd) => {
          // If the user runs an analysis command, update the finding text or account view
          if (cmd.includes('ACC-1042') || cmd.includes('structuring')) {
            console.log('[CoCo CLI Sync] Synchronized command execution with investigation workspace:', cmd);
          }
        }}
      />
    </div>
  );
}
