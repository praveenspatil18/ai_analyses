import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw,
} from 'lucide-react';
import { aiApi } from '../../services/api';
import { AICoachMessage } from '../../types';
import { useApp } from '../../context/AppContext';

export const AICareerCoachPage: React.FC = () => {
  const { user, targetRole, roleFit, showToast } = useApp();
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    'Why is my Role Fit score low and how do I raise it?',
    'What should I study this week to make the most progress?',
    'What foundational concepts should I master before React?',
    'Recommend a portfolio project to close my JavaScript gap',
    'How should I prepare for technical interviews for this role?',
  ];

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const res = await aiApi.getCoachHistory();
      if (res.history && res.history.length > 0) {
        setMessages(res.history);
      } else {
        // Welcome message
        setMessages([
          {
            id: 'init-msg',
            sender: 'assistant',
            content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your CareerAI intelligence mentor. I have live access to your target role (${targetRole?.title || 'Frontend Developer'}), your current skill vector, and your active learning roadmap. What would you like to explore?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      console.warn('Failed to load coach history:', err);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isSending) return;

    const userMsg: AICoachMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await aiApi.askCoach(textToSend);
      setMessages((prev) => [...prev, res.message]);
    } catch (err: any) {
      showToast(err.message || 'AI Mentor failed to respond', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden max-w-4xl mx-auto">
      {/* Coach Header Bar */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>CareerAI Intelligence Coach</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[11px] text-slate-500">
              Synchronized with: <strong className="text-slate-700">{targetRole?.title}</strong> ({roleFit?.fitScore}% Role Fit)
            </p>
          </div>
        </div>

        {/* Top Gap Pill */}
        {roleFit?.topGaps[0] && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-1 rounded-md font-medium">
            <span>Critical Gap:</span>
            <strong className="font-semibold">{roleFit.topGaps[0].skill}</strong>
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-xl p-4 text-xs md:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.content}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(act.label)}
                        className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Analyzing skill gaps and formulating recommendation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Carousel */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-thin">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      )}

      {/* Input Composer */}
      <div className="p-3 md:p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI Coach about roadmaps, skill gaps, code interview tips, or project ideas..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden resize-none max-h-32"
          />
          <button
            onClick={() => handleSend()}
            disabled={isSending || !input.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-lg transition-colors shrink-0 shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
