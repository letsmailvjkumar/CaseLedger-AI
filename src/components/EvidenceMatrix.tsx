import React, { useState } from 'react';
import { EvidenceItem, PolicyCitation } from '../types';
import { ShieldAlert, CheckCircle2, BookOpen, AlertCircle, FileSearch, Pin, ExternalLink, Check, Info } from 'lucide-react';

interface EvidenceMatrixProps {
  evidenceItems: EvidenceItem[];
  policies: PolicyCitation[];
  onToggleEvidencePinned?: (id: string) => void;
  pinnedIds?: string[];
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({
  evidenceItems,
  policies,
  onToggleEvidencePinned,
  pinnedIds = ['EVD-01', 'EVD-02', 'EVD-03', 'EVD-04', 'EVD-05'],
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUPPORTING' | 'CONTRADICTING' | 'POLICY' | 'MISSING'>('ALL');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyCitation | null>(null);

  const supportingCount = evidenceItems.filter((e) => e.category === 'SUPPORTING').length;
  const contradictingCount = evidenceItems.filter((e) => e.category === 'CONTRADICTING').length;
  const policyCount = evidenceItems.filter((e) => e.category === 'POLICY').length;
  const missingCount = evidenceItems.filter((e) => e.category === 'MISSING').length;

  const filteredItems = evidenceItems.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.category === activeTab;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Header with 4-Quadrant Filter Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-cyan-400" />
              <span>Multi-Dimensional Evidence Matrix</span>
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
              Responsible AI • Anti-Confirmation Bias
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Balanced evidentiary assessment combining incriminating patterns with statutory mitigating factors.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'ALL' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({evidenceItems.length})
          </button>
          <button
            onClick={() => setActiveTab('SUPPORTING')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeTab === 'SUPPORTING'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-red-400 hover:text-red-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Supporting ({supportingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('CONTRADICTING')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeTab === 'CONTRADICTING'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Contradicting ({contradictingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('POLICY')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeTab === 'POLICY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Policy Basis ({policyCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('MISSING')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeTab === 'MISSING'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'text-yellow-400 hover:text-yellow-300'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Missing Docs ({missingCount})</span>
          </button>
        </div>
      </div>

      {/* Evidentiary Cards Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto flex-1">
        {filteredItems.map((item) => {
          const isPinned = pinnedIds.includes(item.id);

          let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
          let borderAccent = 'border-slate-800';
          let icon = <Info className="w-4 h-4 text-slate-400" />;

          if (item.category === 'SUPPORTING') {
            badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
            borderAccent = 'border-red-900/30 hover:border-red-500/40';
            icon = <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />;
          } else if (item.category === 'CONTRADICTING') {
            badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            borderAccent = 'border-emerald-900/30 hover:border-emerald-500/40';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
          } else if (item.category === 'POLICY') {
            badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
            borderAccent = 'border-cyan-900/30 hover:border-cyan-500/40';
            icon = <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />;
          } else if (item.category === 'MISSING') {
            badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            borderAccent = 'border-yellow-900/30 hover:border-yellow-500/40';
            icon = <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />;
          }

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl bg-slate-950/70 border ${borderAccent} transition-all flex flex-col justify-between shadow-sm relative group`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-xs text-slate-200">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badgeColor}`}>
                      {item.category}
                    </span>
                    {onToggleEvidencePinned && (
                      <button
                        onClick={() => onToggleEvidencePinned(item.id)}
                        className={`p-1 rounded transition-colors ${
                          isPinned
                            ? 'text-cyan-400 bg-cyan-500/10'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={isPinned ? 'Included in Regulatory Pack' : 'Click to pin to report'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">{item.description}</p>

                {/* Sub data points */}
                <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 mb-2">
                  {item.dataPoints.map((point, pIdx) => (
                    <div key={pIdx} className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Citations */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                {item.referenceId && (
                  <span className="font-mono text-slate-500">Ref: {item.referenceId}</span>
                )}
                {item.policyRef && (
                  <button
                    onClick={() => {
                      const matched = policies.find((p) => p.id === item.policyRef?.split(' ')[0]);
                      if (matched) setSelectedPolicy(matched);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 ml-auto"
                  >
                    <span>{item.policyRef}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Excerpt Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h4 className="font-semibold text-sm text-slate-100">{selectedPolicy.policyName}</h4>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg font-mono text-slate-300">
                <div>Section: <span className="text-cyan-300">{selectedPolicy.section}</span></div>
                <div>Version: <span className="text-cyan-300">{selectedPolicy.version}</span></div>
                <div>Source: <span className="text-slate-400">{selectedPolicy.sourceDoc} (p.{selectedPolicy.sourcePage})</span></div>
                <div>Effective Date: <span className="text-slate-400">{selectedPolicy.effectiveDate}</span></div>
              </div>

              <div className="bg-slate-950/90 border border-cyan-500/20 p-3 rounded-lg text-slate-200 italic leading-relaxed">
                "{selectedPolicy.excerptText}"
              </div>

              <div>
                <span className="font-semibold text-slate-200">Relevance to Active Case:</span>
                <p className="text-slate-400 mt-1">{selectedPolicy.relevanceExplanation}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPolicy(null)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
              >
                Close Policy Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
