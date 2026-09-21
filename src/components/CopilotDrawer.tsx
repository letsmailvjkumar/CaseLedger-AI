import React, { useState, useRef, useEffect } from 'react';
import { Account, Transaction, CopilotMessage } from '../types';
import { Send, Bot, User, Sparkles, ShieldCheck, Scale, FileText, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface CopilotDrawerProps {
  currentAccount: Account;
  transactions: Transaction[];
  onApplyDraftToFinding?: (draftText: string) => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  currentAccount,
  transactions,
  onApplyDraftToFinding,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-0',
      sender: 'copilot',
      timestamp: '10:15 AM',
      text: `Hello, Priya. I am **CaseLedger Governed Copilot**. I have loaded account **${currentAccount.id}** (${currentAccount.holderName}) and synthesized 11 transactions against **AML Policy v2026.3** and **RBI Master Directions**.

How would you like to proceed with the investigation?`,
      suggestedActions: [
        'Why was ACC-1042 flagged?',
        'What evidence contradicts the suspicious interpretation?',
        'Show applicable AML policy clauses and rule versions',
        'Draft regulatory finding summary',
      ],
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || isLoading) return;

    // Detect which governed analytical tool to invoke
    let tool = 'general_inquiry';
    const lowerQ = q.toLowerCase();
    if (lowerQ.includes('why') || lowerQ.includes('flag') || lowerQ.includes('structur')) {
      tool = 'detect_structuring';
    } else if (lowerQ.includes('contradict') || lowerQ.includes('legit') || lowerQ.includes('terminal')) {
      tool = 'find_shared_entities';
    } else if (lowerQ.includes('policy') || lowerQ.includes('regulat') || lowerQ.includes('clause')) {
      tool = 'retrieve_policy_clause';
    } else if (lowerQ.includes('draft') || lowerQ.includes('finding') || lowerQ.includes('report')) {
      tool = 'generate_case_pack';
    } else if (lowerQ.includes('velocity') || lowerQ.includes('pass-through')) {
      tool = 'calculate_pass_through_ratio';
    }

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);
    setActiveTool(tool);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          toolName: tool,
          caseContext: {
            account: currentAccount,
            transactionsCount: transactions.length,
            flaggedCount: transactions.filter((t) => t.isFlagged).length,
          },
        }),
      });

      const data = await response.json();
      const botMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'copilot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.answer || 'Governed analysis complete.',
        toolUsed: tool,
        policyCitations: ['AML Policy 2026.3 Sec 4.2', 'RBI Master Direction Cl 37(a)'],
        suggestedActions: tool === 'generate_case_pack' ? ['Export Audit Pack', 'View Decision Replay'] : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'copilot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `### Governed Analysis: ${currentAccount.id}
Triggered Rules:
1. Structuring (8 sub-threshold credits totaling ₹74.20L)
2. Rapid Pass-through (87.4% disbursed within 3.2 hours)
3. Mitigating Factor: Device DEV-MUM-8842 attributed to Branch RM-402 customer tablet (SOP 8.4).`,
          toolUsed: tool,
        },
      ]);
    } finally {
      setIsLoading(false);
      setActiveTool(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">CaseLedger Governed Copilot</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Audit-Ready
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Grounded in transaction ledger & AML policy corpus
            </div>
          </div>
        </div>

        {activeTool && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] font-mono text-cyan-300 border border-cyan-500/30 animate-pulse">
            <Scale className="w-3 h-3" />
            <span>Invoking tool: {activeTool}</span>
          </div>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'copilot' && (
              <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800/90 text-slate-200 shadow-md'
              }`}
            >
              {msg.toolUsed && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 mb-2 border-b border-slate-800 pb-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Governed Tool Execution: {msg.toolUsed}()</span>
                </div>
              )}

              {/* Text Render with Markdown Support */}
              <div className="space-y-2 prose prose-invert prose-sm max-w-none text-slate-200">
                {msg.text.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h4 key={pIdx} className="text-sm font-bold text-cyan-300 mt-2 mb-1">
                        {paragraph.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('**') && paragraph.includes(':**')) {
                    return (
                      <p key={pIdx} className="text-xs text-slate-300 my-1">
                        <strong className="text-slate-100">{paragraph.split(':**')[0].replace('**', '')}:</strong>
                        {paragraph.split(':**')[1]}
                      </p>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-xs text-slate-300 my-1 whitespace-pre-line">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Action to inject draft into Finding Builder */}
              {msg.sender === 'copilot' && onApplyDraftToFinding && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Model: Gemini 3.8 Flash / Governed v2.4
                  </span>
                  <button
                    onClick={() => onApplyDraftToFinding(msg.text)}
                    className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Send to Finding Builder</span>
                  </button>
                </div>
              )}

              {/* Suggested quick pill buttons */}
              {msg.suggestedActions && (
                <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(action)}
                      className="px-2.5 py-1 rounded-md bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-[11px] text-cyan-300 hover:bg-slate-800 transition-all text-left flex items-center gap-1"
                    >
                      <span>{action}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-md bg-cyan-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Querying transaction telemetry & AML policy corpus...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a compliance or risk question (e.g., 'What contradicts this alert?')..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Inquire</span>
          </button>
        </form>
      </div>
    </div>
  );
};
