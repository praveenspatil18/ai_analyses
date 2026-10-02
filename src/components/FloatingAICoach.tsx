import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  User,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { aiApi } from '../services/api';
import { AICoachMessage } from '../types';
import { useApp } from '../context/AppContext';

export const FloatingAICoach: React.FC = () => {
  const { user, targetRole, roleFit, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [persona, setPersona] = useState<'mentor' | 'interviewer' | 'strategist' | 'code_mentor'>('mentor');
  const [modelChoice, setModelChoice] = useState<'balanced' | 'fast'>('balanced');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const loadHistory = async () => {
    try {
      const res = await aiApi.getCoachHistory();
      if (res.history && res.history.length > 0) {
        setMessages(res.history);
      } else {
        setMessages([
          {
            id: 'init-msg',
            sender: 'assistant',
            content: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm your CareerAI live mentor. How can I help with your ${targetRole?.title || 'target career'} goals today?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // fallback
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isSending) return;

    const userMsg: AICoachMessage = {
      id: `float-msg-${Date.now()}-u`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('careerai_auth_token') || ''}`,
        },
        body: JSON.stringify({ message: text, persona, modelChoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get answer');
      setMessages((prev) => [...prev, data.message]);
    } catch (err: any) {
      showToast(err.message || 'AI coach error', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-16 md:bottom-6 right-6 z-40 p-3.5 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group ring-4 ring-indigo-500/20"
          aria-label="Open AI Career Coach"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold hidden sm:inline-block pr-1">
            Ask CareerAI Coach
          </span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 shadow-2xl flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-16 md:bottom-6 right-4 md:right-6 w-[94vw] sm:w-[420px] h-[540px]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
                CA
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Gemini AI Career Coach</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <span className="text-[10px] text-slate-400">
                  Target: {targetRole?.title} ({roleFit?.fitScore}% Fit)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:text-white rounded"
                title={isExpanded ? 'Restore' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls Bar: Persona & Model Selection */}
          <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Role:</span>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as any)}
                className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-slate-700"
              >
                <option value="mentor">Career Mentor</option>
                <option value="interviewer">Mock Interviewer</option>
                <option value="code_mentor">Code Architect</option>
                <option value="strategist">Hiring Strategist</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-400">Engine:</span>
              <select
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value as any)}
                className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-slate-700"
              >
                <option value="balanced">Gemini Flash (Standard)</option>
                <option value="fast">Gemini Flash-Lite (Fast)</option>
              </select>
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isUser ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs whitespace-pre-line'
                    }`}
                  >
                    {m.content}

                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {m.suggestedActions.map((act, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(act.label)}
                            className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-medium border border-indigo-200"
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 text-slate-400 p-2 text-[11px]">
                <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                <span>Coach is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 focus-within:ring-2 focus-within:ring-indigo-500/20">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask advice on roadmap, skills, or interview tips..."
                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-slate-900 focus:outline-hidden"
              />
              <button
                onClick={() => handleSend()}
                disabled={isSending || !input.trim()}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
