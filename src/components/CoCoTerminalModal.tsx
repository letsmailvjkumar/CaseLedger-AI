import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Play, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  X, 
  FileCode, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { CoCoCommandLog, SnowflakeStatus } from '../types';

interface CoCoTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandRun?: (cmd: string) => void;
}

export const CoCoTerminalModal: React.FC<CoCoTerminalModalProps> = ({
  isOpen,
  onClose,
  onCommandRun,
}) => {
  const [activeTab, setActiveTab] = useState<'TERMINAL' | 'WORKSHOP_1' | 'WORKSHOP_2' | 'FILES'>('TERMINAL');
  const [inputCommand, setInputCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('coco.config.toml');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [logs, setLogs] = useState<CoCoCommandLog[]>([
    {
      id: 'init-0',
      command: 'coco env status',
      output: `[CoCo CLI] Probing Snowflake Connection Profile...
✔ Connected to Snowflake Account: org-fincrime-gcc.snowflakecomputing.com
✔ Current Warehouse: COMPLIANCE_WH (State: STARTED, Size: X-SMALL)
✔ Current Database:  CASELEDGER_DB
✔ Current Schema:    AML_CORE
✔ Current Role:      AML_INVESTIGATOR_ROLE
✔ Cortex Search:     AML_POLICY_SEARCH_SVC (ACTIVE, Target Lag: 1h)
✔ Cortex Analyst:    cortex/semantic_model.yaml (VALIDATED)
✔ Streamlit Stage:   @CASELEDGER_DB.AML_CORE.STREAMLIT_STAGE (READY)`,
      queryId: '01b6e492-4f21-88c9-0001',
      durationMs: 48,
      exitCode: 0,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [snowflakeStatus, setSnowflakeStatus] = useState<SnowflakeStatus | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/coco/status')
        .then((res) => res.json())
        .then((data) => setSnowflakeStatus(data))
        .catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'TERMINAL') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  if (!isOpen) return null;

  const handleExecute = async (cmdToRun?: string) => {
    const command = (cmdToRun || inputCommand).trim();
    if (!command || isExecuting) return;

    setInputCommand('');
    setIsExecuting(true);
    setHistoryIndex(-1);

    if (onCommandRun) {
      onCommandRun(command);
    }

    try {
      const res = await fetch('/api/coco/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();

      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command,
          output: data.output || 'Command finished.',
          queryId: data.queryId,
          durationMs: data.durationMs || 45,
          exitCode: data.exitCode ?? 0,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (e: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          command,
          output: `[CoCo CLI Error] Network or API failure: ${e.message}`,
          exitCode: 1,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const executedCommands = logs.map((l) => l.command).filter(Boolean);
      if (executedCommands.length === 0) return;
      const nextIndex = historyIndex === -1 ? executedCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputCommand(executedCommands[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const executedCommands = logs.map((l) => l.command).filter(Boolean);
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= executedCommands.length) {
        setHistoryIndex(-1);
        setInputCommand('');
      } else {
        setHistoryIndex(nextIndex);
        setInputCommand(executedCommands[nextIndex]);
      }
    }
  };

  const clearTerminal = () => {
    setLogs([]);
  };

  const sampleFiles: Record<string, { desc: string; code: string }> = {
    'coco.config.toml': {
      desc: 'Snowflake CoCo CLI configuration for the CaseLedger AI project',
      code: `[project]
name = "caseledger-aml-copilot"
version = "1.4.2"
description = "Governed 3D AML investigation & decision replay copilot with Snowflake Cortex AI"

[snowflake]
account = "org-fincrime-gcc"
user = "AML_COMPLIANCE_AGENT"
role = "AML_INVESTIGATOR_ROLE"
warehouse = "COMPLIANCE_WH"
database = "CASELEDGER_DB"
schema = "AML_CORE"

[cortex]
default_model = "snowflake-arctic"
reasoning_model = "claude-3-5-sonnet"
search_service = "CASELEDGER_DB.AML_CORE.AML_POLICY_SEARCH_SVC"
semantic_model = "cortex/semantic_model.yaml"`,
    },
    'ddl/01_aml_schema.sql': {
      desc: 'Snowflake DDL for Accounts, Transactions, Evidence & Decision Replays',
      code: `CREATE DATABASE IF NOT EXISTS CASELEDGER_DB;
CREATE SCHEMA IF NOT EXISTS CASELEDGER_DB.AML_CORE;
USE SCHEMA CASELEDGER_DB.AML_CORE;

CREATE OR REPLACE TABLE TRANSACTIONS (
    TRANSACTION_ID VARCHAR(64) PRIMARY KEY,
    SOURCE_ACCOUNT_ID VARCHAR(32),
    COUNTERPARTY_NAME VARCHAR(256),
    TRANSACTION_TYPE VARCHAR(16),
    CHANNEL VARCHAR(32),
    AMOUNT NUMBER(18,2),
    CTR_PROXIMITY NUMBER(5,4),
    IS_FLAGGED BOOLEAN DEFAULT FALSE,
    DEVICE_ID VARCHAR(64),
    EXECUTION_TIMESTAMP TIMESTAMP_NTZ
);

CREATE OR REPLACE TABLE DECISION_REPLAY_SNAPSHOTS (
    SNAPSHOT_ID VARCHAR(64) PRIMARY KEY,
    CASE_ID VARCHAR(32) NOT NULL,
    DATA_FREEZE_CHECKSUM VARCHAR(128) NOT NULL,
    ORIGINAL_AI_DRAFT TEXT,
    DISPOSITION VARCHAR(64),
    REVIEWER_NAME VARCHAR(128),
    SEALED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);`,
    },
    'cortex/semantic_model.yaml': {
      desc: 'Snowflake Cortex Analyst semantic data model for AML transactions & velocity',
      code: `name: CaseLedger_AML_Semantic_Model
description: Semantic view over transaction flows, CTR thresholds, and account risk flags.

tables:
  - name: TRANSACTIONS
    base_table:
      database: CASELEDGER_DB
      schema: AML_CORE
      table: TRANSACTIONS
    dimensions:
      - name: TRANSACTION_ID
      - name: SOURCE_ACCOUNT_ID
      - name: TRANSACTION_TYPE
      - name: IS_FLAGGED
    measures:
      - name: AMOUNT
        default_aggregation: sum
      - name: CTR_PROXIMITY
        default_aggregation: avg`,
    },
    'streamlit/streamlit_app.py': {
      desc: 'Companion Streamlit in Snowflake App deployed via CoCo CLI',
      code: `import streamlit as st

st.title("🛡️ CaseLedger AI - Snowflake Compliance Dashboard")
st.caption("Built with Snowflake CoCo CLI • Powered by Snowflake Cortex AI")

col1, col2, col3 = st.columns(3)
col1.metric("Subject Account", "ACC-1042", "Rohit Sharma Traders")
col2.metric("Total Flagged Inflow", "₹74.20 Lakh", "8 Sub-threshold TXNs")
col3.metric("Pass-Through Velocity", "87.4%", "3.2 Hours Outflow")

st.info("Mitigating Evidence Verified: Terminal DEV-MUM-8842 attributed to Branch RM-402 customer tablet.")`,
    },
  };

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-150">
      <div
        className={`bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
        }`}
      >
        {/* Top App Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white font-mono tracking-tight">
                  Snowflake <span className="text-sky-400">CoCo CLI</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  v1.4.2 Cortex Code
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  COMPLIANCE_WH Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official GCC Hackathon AI Toolchain • Workshop 1 & 2 Certified Environment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950/60 px-4 pt-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto select-none">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('TERMINAL')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'TERMINAL'
                  ? 'bg-slate-900 text-sky-300 border-t-2 border-sky-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Interactive CLI</span>
            </button>

            <button
              onClick={() => setActiveTab('WORKSHOP_1')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'WORKSHOP_1'
                  ? 'bg-slate-900 text-emerald-300 border-t-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Workshop 1: CLI & Data</span>
            </button>

            <button
              onClick={() => setActiveTab('WORKSHOP_2')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'WORKSHOP_2'
                  ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Workshop 2: Cortex AI Apps</span>
            </button>

            <button
              onClick={() => setActiveTab('FILES')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'FILES'
                  ? 'bg-slate-900 text-amber-300 border-t-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Snowflake Project Assets</span>
            </button>
          </div>

          {activeTab === 'TERMINAL' && (
            <button
              onClick={clearTerminal}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 hover:bg-slate-800 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Tab 1: Interactive Terminal */}
        {activeTab === 'TERMINAL' && (
          <div className="flex-1 flex flex-col bg-slate-950 font-mono text-xs overflow-hidden">
            {/* Command quick execution chips */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 font-bold">
                Quick CoCo Recipes:
              </span>
              {[
                'coco env status',
                'coco sql --file ddl/01_aml_schema.sql',
                'coco cortex search --query "Section 4.2 smurfing limits"',
                'coco cortex analyst "What is the pass-through ratio for ACC-1042?"',
                'coco agent "Analyze account ACC-1042 for structuring and branch device linkage"',
                'coco deploy streamlit',
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleExecute(cmd)}
                  disabled={isExecuting}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-500/40 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
                >
                  <Play className="w-2.5 h-2.5 text-sky-400" />
                  <span>{cmd}</span>
                </button>
              ))}
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono select-text">
              <div className="text-slate-400 text-xs border-b border-slate-800/80 pb-2">
                Snowflake CoCo CLI Session initialized. Account: <span className="text-sky-300">org-fincrime-gcc</span> • Warehouse: <span className="text-emerald-300">COMPLIANCE_WH</span> • Database: <span className="text-indigo-300">CASELEDGER_DB</span>
                <br />Type <span className="text-amber-300">coco help</span> or click any quick recipe above to test Workshop 1 and Workshop 2 features.
              </div>

              {logs.map((log) => (
                <div key={log.id} className="space-y-1.5 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-sky-400">org-fincrime-gcc:~$</span>
                      <span className="font-semibold text-white">{log.command}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      {log.queryId && <span className="text-slate-500">QID: {log.queryId}</span>}
                      {log.durationMs && <span className="text-slate-400">{log.durationMs}ms</span>}
                      <span className={log.exitCode === 0 ? 'text-emerald-400' : 'text-red-400'}>
                        exit: {log.exitCode}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                    {log.output}
                  </div>
                </div>
              ))}

              {isExecuting && (
                <div className="flex items-center gap-2 text-sky-400 animate-pulse text-xs py-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>Executing on Snowflake warehouse COMPLIANCE_WH via Cortex Engine...</span>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>

            {/* Command Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <span className="text-sky-400 font-mono font-bold select-none text-xs">coco &gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command (e.g. coco env status, coco agent, coco sql --run) or press Up/Down for history..."
                disabled={isExecuting}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
              />
              <button
                onClick={() => handleExecute()}
                disabled={isExecuting || !inputCommand.trim()}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors font-mono"
              >
                <Play className="w-3 h-3" />
                <span>Run</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Workshop 1 Guide & Quick Actions */}
        {activeTab === 'WORKSHOP_1' && (
          <div className="flex-1 p-6 bg-slate-950 overflow-y-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Workshop 1: Getting Started with Snowflake CoCo CLI
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Environment Setup & Schema Deployment</h3>
              <p className="text-xs text-slate-400 mt-1">
                Workshop 1 covers CoCo CLI installation, configuring Snowflake project parameters, deploying table DDLs, and verifying telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">Step 1: Inspect CoCo Profile</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300">Done</span>
                </div>
                <p className="text-xs text-slate-300">
                  Verifies connection to the active Snowflake GCC instance and warehouse <code className="text-sky-300 font-mono">COMPLIANCE_WH</code>.
                </p>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                  <span>coco env status</span>
                  <button
                    onClick={() => {
                      setActiveTab('TERMINAL');
                      handleExecute('coco env status');
                    }}
                    className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium"
                  >
                    Run in CLI
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">Step 2: Deploy AML DDLs</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300">Done</span>
                </div>
                <p className="text-xs text-slate-300">
                  Creates <code className="text-sky-300 font-mono">ACCOUNTS</code>, <code className="text-sky-300 font-mono">TRANSACTIONS</code>, <code className="text-sky-300 font-mono">EVIDENCE_RECORDS</code>, and <code className="text-sky-300 font-mono">DECISION_REPLAY_SNAPSHOTS</code> on Snowflake.
                </p>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                  <span>coco sql --file ddl/01_aml_schema.sql</span>
                  <button
                    onClick={() => {
                      setActiveTab('TERMINAL');
                      handleExecute('coco sql --file ddl/01_aml_schema.sql');
                    }}
                    className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium"
                  >
                    Run in CLI
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">Step 3: Query Live Structured Ledger</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300">Done</span>
                </div>
                <p className="text-xs text-slate-300">
                  Executes analytical SQL over transactions with CTR threshold proximity analysis against the ₹10 Lakh statutory limit.
                </p>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                  <span className="truncate mr-2">coco sql --run "SELECT * FROM TRANSACTIONS LIMIT 5"</span>
                  <button
                    onClick={() => {
                      setActiveTab('TERMINAL');
                      handleExecute('coco sql --run "SELECT * FROM CASELEDGER_DB.AML_CORE.TRANSACTIONS LIMIT 5"');
                    }}
                    className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium shrink-0"
                  >
                    Run in CLI
                  </button>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">Step 4: Check CLI Configuration</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300">Done</span>
                </div>
                <p className="text-xs text-slate-300">
                  Validates the project root configuration <code className="text-sky-300 font-mono">coco.config.toml</code> and environment secrets.
                </p>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                  <span>coco --version</span>
                  <button
                    onClick={() => {
                      setActiveTab('TERMINAL');
                      handleExecute('coco --version');
                    }}
                    className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium"
                  >
                    Run in CLI
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Workshop 2 Guide & AI Apps */}
        {activeTab === 'WORKSHOP_2' && (
          <div className="flex-1 p-6 bg-slate-950 overflow-y-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider font-bold">
                <Sparkles className="w-4 h-4" />
                Workshop 2: Building AI Applications with Snowflake CoCo CLI
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Cortex AI, Semantic Search & Streamlit Deployment</h3>
              <p className="text-xs text-slate-400 mt-1">
                Workshop 2 demonstrates deploying Snowflake Cortex Search, Cortex Analyst semantic models, governed AI agents, and deploying companion apps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Step 1: Cortex Search */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">1. Cortex Search Service</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300">Cortex Search</span>
                </div>
                <p className="text-xs text-slate-300">
                  Low-latency semantic retrieval over indexed AML policies and RBI Master Directions using vector embeddings on Snowflake.
                </p>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                  <span className="truncate mr-2">coco cortex search --query "Section 4.2 smurfing limits"</span>
                  <button
                    onClick={() => {
                      setActiveTab('TERMINAL');
                      handleExecute('coco cortex search --query "Section 4.2 smurfing limits"');
                    }}
                    className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium shrink-0"
                  >
                    Run in CLI
                  </button>
                </div>
              </div>

              {/* AI Step 2: Cortex Analyst */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">2. Cortex Analyst Semantic Model</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300">Text-to-SQL</span>
                </div>
                <p className="text-xs text-slate-300">
                  Translates natural language compliance questions into verified Snowflake SQL queries via <code className="text-sky-300 font-mono">cortex/semantic_model.yaml</code>.
                </p>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                  <span className="truncate mr-2">coco cortex analyst "What is the pass-through ratio for ACC-1042?"</span>
                  <button
                    onClick={() => {
                      setActiveTab('TERMINAL');
                      handleExecute('coco cortex analyst "What is the pass-through ratio for ACC-1042?"');
                    }}
                    className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium shrink-0"
                  >
                    Run in CLI
                  </button>
                </div>
              </div>

              {/* AI Step 3: Governed Agent */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">3. Autonomous Governed Agent</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300">Multi-Tool</span>
                </div>
                <p className="text-xs text-slate-300">
                  Invokes the CoCo compliance agent to scan structuring, calculate pass-through velocities, and retrieve mitigating branch desk tablet evidence.
                </p>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                  <span className="truncate mr-2">coco agent "Analyze ACC-1042 structuring"</span>
                  <button
                    onClick={() => {
                      setActiveTab('TERMINAL');
                      handleExecute('coco agent "Analyze account ACC-1042 for structuring and branch device linkage"');
                    }}
                    className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium shrink-0"
                  >
                    Run in CLI
                  </button>
                </div>
              </div>

              {/* AI Step 4: Streamlit in Snowflake */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">4. Streamlit in Snowflake Deploy</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300">App Deploy</span>
                </div>
                <p className="text-xs text-slate-300">
                  Deploys <code className="text-sky-300 font-mono">streamlit/streamlit_app.py</code> to <code className="text-sky-300 font-mono">@STREAMLIT_STAGE</code> and registers it in Snowflake.
                </p>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                  <span>coco deploy streamlit</span>
                  <button
                    onClick={() => {
                      setActiveTab('TERMINAL');
                      handleExecute('coco deploy streamlit');
                    }}
                    className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium"
                  >
                    Run in CLI
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Snowflake Project Files */}
        {activeTab === 'FILES' && (
          <div className="flex-1 flex flex-col md:flex-row bg-slate-950 overflow-hidden font-mono text-xs">
            {/* Sidebar list of files */}
            <div className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1 overflow-y-auto">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2 py-1">
                Generated CoCo Assets
              </div>
              {Object.keys(sampleFiles).map((filename) => (
                <button
                  key={filename}
                  onClick={() => setSelectedFile(filename)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors ${
                    selectedFile === filename
                      ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{filename}</span>
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{selectedFile}</span>
                  <span className="text-[11px] text-slate-500 ml-2">
                    {sampleFiles[selectedFile]?.desc}
                  </span>
                </div>
                <button
                  onClick={() => copyCode(selectedFile, sampleFiles[selectedFile]?.code || '')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded flex items-center gap-1.5 text-xs transition-colors"
                >
                  {copiedFile === selectedFile ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 p-4 overflow-auto bg-slate-950 text-slate-200 leading-relaxed font-mono">
                <pre className="text-xs whitespace-pre-wrap selection:bg-sky-500/30">
                  {sampleFiles[selectedFile]?.code}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
