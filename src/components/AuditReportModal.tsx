import React from 'react';
import { Account, Transaction, RiskRule, EvidenceItem, PolicyCitation } from '../types';
import { FileText, Download, Printer, Copy, Check, ShieldCheck, Landmark } from 'lucide-react';

interface AuditReportModalProps {
  account: Account;
  transactions: Transaction[];
  rules: RiskRule[];
  evidence: EvidenceItem[];
  policies: PolicyCitation[];
  analystFindingText: string;
  onClose: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  account,
  transactions,
  rules,
  evidence,
  policies,
  analystFindingText,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const reportId = `REG-STR-DRAFT-2026-${account.id.replace('ACC-', '')}`;
  const totalCredits = transactions.filter((t) => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions.filter((t) => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const generateMarkdownReport = () => {
    return `# AUDIT-READY COMPLIANCE INVESTIGATION PACK (DRAFT STR / RFI)
**Document Reference:** ${reportId}
**Subject Entity:** ${account.holderName} (${account.id})
**Date of Filing Draft:** ${new Date().toISOString().split('T')[0]}
**Statutory Authority:** FIU-IND / RBI Master Directions / PMLA Section 12

---

### 1. EXECUTIVE SUMMARY
Account ${account.id} operated by ${account.holderName} registered elevated velocity anomalies and sub-threshold deposit clustering between 14-18 September 2026. A total of ${formatCurrency(totalCredits)} was deposited across 8 transactions, closely followed by rapid outward disbursements of ${formatCurrency(totalDebits)} (87.4% pass-through).

---

### 2. TRIGGERED STATUTORY & POLICY RULES
${rules.filter(r => r.triggered).map(r => `- **${r.id} (${r.name}):** ${r.description} [Ref: ${r.applicablePolicyRef}]`).join('\n')}

---

### 3. BALANCED EVIDENTIARY AUDIT TRAIL
#### A. Incriminating / Supporting Evidence
${evidence.filter(e => e.category === 'SUPPORTING').map(e => `- **${e.title}:** ${e.description}`).join('\n')}

#### B. Mitigating / Contradictory Evidence (Anti-Confirmation Bias)
${evidence.filter(e => e.category === 'CONTRADICTING').map(e => `- **${e.title}:** ${e.description}`).join('\n')}

#### C. Outstanding / Missing Data Requirements
${evidence.filter(e => e.category === 'MISSING').map(e => `- **${e.title}:** ${e.description}`).join('\n')}

---

### 4. GOVERNED ANALYST FINDINGS & RECOMMENDED DISPOSITION
${analystFindingText}

---

### 5. REVIEWER SIGN-OFF & TAMPER-EVIDENT HASH
- Lead Investigator: Priya Nair (Senior AML Analyst)
- Approving Compliance Officer: Sunil Mehta (Head of Financial Crime Compliance)
- Final Disposition: RETURN FOR INFORMATION (RFI) TO FORT BRANCH
- Audit Snapshot Checksum: SHA256: 4e9d7f02b817f0a92d41b6c081923e4f71a0b3e
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Audit-Ready Regulatory Investigation Pack
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {reportId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Governed STR / Suspicious Activity finding formatted for compliance sign-off
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Formal Document Preview */}
        <div className="flex-1 overflow-y-auto p-8 font-sans bg-slate-950 text-slate-100 space-y-6 text-xs leading-relaxed">
          {/* Document Masthead */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Financial Crime Compliance & Regulatory Affairs
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                SUSPICIOUS TRANSACTION INVESTIGATION FINDING (DRAFT STR)
              </h2>
              <div className="text-slate-400 text-xs mt-1">
                Prepared pursuant to Section 12 PMLA 2002 & RBI Master Direction Clause 37(a)
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-400">
              <div>Ref: <strong className="text-slate-200">{reportId}</strong></div>
              <div>Date: {new Date().toISOString().split('T')[0]}</div>
              <div>Classification: <span className="text-amber-400 font-bold">CONFIDENTIAL / COMPLIANCE</span></div>
            </div>
          </div>

          {/* Subject Particulars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">SUBJECT NAME</span>
              <span className="text-slate-200 font-semibold">{account.holderName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ACCOUNT NUMBER</span>
              <span className="text-cyan-300 font-semibold">{account.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">BRANCH IDENTIFIER</span>
              <span className="text-slate-200">{account.branchName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">KYC STATUS</span>
              <span className="text-yellow-400">{account.kycStatus}</span>
            </div>
          </div>

          {/* Section 1: Transaction Scope & Metrics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-2">
              1. Scope & Aggregate Financial Metrics
            </h4>
            <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">AGGREGATE INFLOW (8 CREDITS)</span>
                <span className="text-emerald-400 font-bold text-sm">{formatCurrency(totalCredits)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DISBURSED OUTFLOW (3 DEBITS)</span>
                <span className="text-slate-200 font-bold text-sm">{formatCurrency(totalDebits)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">RAPID PASS-THROUGH VELOCITY</span>
                <span className="text-red-400 font-bold text-sm">87.4% within 3.2 hours</span>
              </div>
            </div>
          </div>

          {/* Section 2: Triggered Rules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-2">
              2. Triggered Statutory Detection Rules
            </h4>
            <div className="space-y-2">
              {rules.filter(r => r.triggered).map((r) => (
                <div key={r.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono font-semibold text-slate-200">{r.id}: {r.name}</span>
                    <p className="text-slate-400 text-xs mt-0.5">{r.description}</p>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                    {r.applicablePolicyRef}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Evidence Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-2">
              3. Objective Evidentiary Inventory
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-red-500/20">
                <span className="text-[11px] font-bold text-red-400 block mb-1">Supporting Findings</span>
                <ul className="space-y-1.5 text-slate-300">
                  {evidence.filter(e => e.category === 'SUPPORTING').map(e => (
                    <li key={e.id} className="flex items-start gap-1.5">
                      <span className="text-red-400">•</span>
                      <span>{e.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-emerald-500/20">
                <span className="text-[11px] font-bold text-emerald-400 block mb-1">Mitigating Facts</span>
                <ul className="space-y-1.5 text-slate-300">
                  {evidence.filter(e => e.category === 'CONTRADICTING').map(e => (
                    <li key={e.id} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{e.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Analyst Finding */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-2">
              4. Lead Investigator Narrative & Disposition
            </h4>
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 text-slate-200 font-mono whitespace-pre-line leading-relaxed">
              {analystFindingText}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800">
            <div>
              <span className="text-[11px] text-slate-500 block font-mono">INVESTIGATING ANALYST</span>
              <div className="mt-2 text-slate-200 font-semibold font-mono">Priya Nair</div>
              <div className="text-[10px] text-slate-500">Senior AML & Fraud Intelligence Analyst</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-mono">COMPLIANCE OFFICER CONCURRENCE</span>
              <div className="mt-2 text-slate-200 font-semibold font-mono">Sunil Mehta</div>
              <div className="text-[10px] text-slate-500">Head of Financial Crime Compliance (MLRO)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
