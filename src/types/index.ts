export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CaseStatus = 'ALERT_DETECTED' | 'UNDER_INVESTIGATION' | 'PENDING_REVIEW' | 'ESCALATED_FIU' | 'RETURNED_RFI' | 'CLOSED_FALSE_POSITIVE';

export interface Account {
  id: string;
  holderName: string;
  accountType: 'CURRENT' | 'SAVINGS' | 'BUSINESS' | 'ESCROW';
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  openDate: string;
  kycStatus: 'VERIFIED' | 'TIER_1_PENDING_UBO' | 'EXPIRED';
  branchId: string;
  branchName: string;
  balance: number;
  currency: string;
  primaryPhone: string;
  primaryEmail: string;
  deviceId: string;
  flaggedDate: string;
  assignedAnalyst: string;
  evidenceCompleteness: number; // 0 - 100%
  primarySignals: string[];
}

export interface Transaction {
  id: string;
  accountId: string;
  timestamp: string;
  amount: number;
  currency: string;
  type: 'CREDIT' | 'DEBIT';
  channel: 'CASH_DEPOSIT' | 'IMPS' | 'RTGS' | 'NEFT' | 'WIRE' | 'UPI';
  counterpartyId: string;
  counterpartyName: string;
  counterpartyAccount: string;
  beneficiaryId?: string;
  deviceId: string;
  branchId: string;
  notes: string;
  isFlagged: boolean;
  flagReason?: string;
  thresholdProximity?: number; // e.g. 0.98 if ₹9.8L against ₹10L threshold
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'SUBJECT_ACCOUNT' | 'LINKED_ACCOUNT' | 'COUNTERPARTY' | 'DEVICE' | 'BENEFICIARY' | 'BRANCH';
  riskLevel: RiskLevel;
  x?: number;
  y?: number;
  z?: number;
  details?: Record<string, any>;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number; // transfer amount or weight
  type: 'FUNDS_FLOW' | 'SHARED_DEVICE' | 'COMMON_BENEFICIARY' | 'BRANCH_TERMINAL';
  timestamp?: string;
  label?: string;
}

export interface RiskRule {
  id: string;
  name: string;
  category: 'STRUCTURING' | 'VELOCITY' | 'NETWORK' | 'THRESHOLD' | 'MITIGATION';
  version: string;
  description: string;
  deterministicLogic: string;
  triggered: boolean;
  scoreContribution: number;
  applicablePolicyRef: string;
}

export interface PolicyCitation {
  id: string;
  policyName: string;
  section: string;
  clause: string;
  effectiveDate: string;
  version: string;
  excerptText: string;
  relevanceExplanation: string;
  sourceDoc: string;
  sourcePage: number;
}

export interface EvidenceItem {
  id: string;
  category: 'SUPPORTING' | 'CONTRADICTING' | 'POLICY' | 'MISSING';
  title: string;
  description: string;
  confidence: 'HIGH' | 'MEDIUM' | 'DOCUMENTED';
  dataPoints: string[];
  referenceId?: string;
  policyRef?: string;
}

export interface CaseSnapshot {
  caseId: string;
  subjectAccountId: string;
  snapshotTimestamp: string;
  dataFreezeChecksum: string;
  investigationWindow: {
    startDate: string;
    endDate: string;
  };
  ruleEngineVersion: string;
  policyCorpusVersion: string;
  triggeredRules: string[];
  calculatedMetrics: {
    totalCreditsInWindow: number;
    subThresholdDepositCount: number;
    passThroughRatio: number;
    turnaroundHours: number;
    sharedDeviceCount: number;
    evidenceCompleteness: number;
  };
  originalAiDraft: string;
  analystEdits: string;
  reviewerDisposition: CaseStatus;
  reviewerNotes: string;
  reviewerId: string;
  signedOffAt: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  timestamp: string;
  text: string;
  toolUsed?: string;
  evidenceCitations?: string[];
  policyCitations?: string[];
  suggestedActions?: string[];
}
