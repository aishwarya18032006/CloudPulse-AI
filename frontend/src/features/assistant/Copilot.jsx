import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSparkles, HiOutlineXMark, HiOutlinePaperAirplane } from "react-icons/hi2";
import { getChatbotResponse } from "../../utils/chatbotKnowledge";
import { renderMarkdown } from "../../utils/renderMarkdown";
import { api } from "../../services/api";
import { useCloud } from "../../context/CloudContext";

const SUGGESTIONS = [
  "What is Cloud Computing?",
  "How can I reduce AWS costs?",
  "Explain Carbon Footprint.",
  "What is Sustainability Score?",
];

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const WELCOME =
  "I'm the CloudPulse AI Assistant — your Enterprise Cloud Intelligence Assistant. Ask about costs, carbon, reports, or any platform feature.";

const toHistory = (messages) =>
  messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, text: m.text }));

export const AIAssistant = () => {
  const { metrics } = useCloud();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: WELCOME, at: formatTime() },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    if (metrics?.aiRecommendations) {
      setMessages([
        {
          role: "assistant",
          text: `${WELCOME}\n\nYour latest AI analysis:\n${metrics.aiRecommendations}`,
          at: formatTime(),
        },
      ]);
    }
  }, [metrics?.aiRecommendations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text) => {
    const t = text.trim();
    if (!t || thinking) return;

    const userMsg = { role: "user", text: t, at: formatTime() };
    const prior = messages;
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const history = toHistory(prior);
      const { reply } = await api.chat({ message: t, history });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: reply, at: formatTime(), ai: true },
      ]);
    } catch (err) {
      const fallback = getChatbotResponse(t);
      const rateLimited = err?.status === 429;
      const notice = rateLimited
        ? err.message || "Too many requests. Please wait a moment."
        : "AI service is temporarily unavailable.";
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `${notice}\n\n${fallback}`,
          at: formatTime(),
          fallback: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-3 z-40 flex h-12 max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] pl-3 pr-4 shadow-[var(--shadow-lg)] sm:bottom-6 sm:right-6 sm:h-14 sm:pl-4 sm:pr-5"
        whileHover={{ scale: 1.03, boxShadow: "var(--shadow-glow)" }}
        whileTap={{ scale: 0.97 }}
        aria-label="Open AI Assistant"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--cyan)] text-white">
          <HiOutlineSparkles className="h-5 w-5" />
        </span>
        <span className="hidden font-display text-sm font-semibold text-[var(--text-primary)] sm:inline">AI Assistant</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:justify-end sm:p-6"
          >
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              className="relative flex h-[min(640px,92vh)] w-full max-w-[min(420px,100%)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)]"
            >
              <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--cyan)] text-white">
                  <HiOutlineSparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-[var(--text-primary)]">CloudPulse AI Assistant</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Enterprise Cloud Intelligence Assistant</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-[var(--bg-subtle)]">
                  <HiOutlineXMark className="h-5 w-5 text-[var(--text-secondary)]" />
                </button>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                        m.role === "user"
                          ? "bg-[var(--accent)] text-white"
                          : "border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <div className="space-y-1">{renderMarkdown(m.text)}</div>
                      ) : (
                        m.text
                      )}
                    </div>
                    {m.at && (
                      <span
                        className={`mt-1 px-1 text-[10px] text-[var(--text-tertiary)] ${
                          m.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        {m.at}
                      </span>
                    )}
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="max-w-[88%] rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-[14px] text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-2">
                        <span className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:300ms]" />
                        </span>
                        CloudPulse AI is thinking...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="border-t border-[var(--border)] p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      disabled={thinking}
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about your cloud…"
                    autoComplete="off"
                    disabled={thinking}
                    className="cp-input flex-1 !shadow-none disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={thinking}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-white disabled:opacity-50"
                  >
                    <HiOutlinePaperAirplane className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/** @deprecated use AIAssistant */
export const Copilot = AIAssistant;
