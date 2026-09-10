"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Menu, RotateCcw } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { supabaseBrowser } from "@/lib/supabase/client";
import { sendChatMessage } from "@/lib/api";
import { newSessionId } from "@/lib/utils";
import type { UiChatMessage, ConversationLog } from "@/lib/types";
import { UserMenu } from "@/components/user-menu";
import { Composer } from "./composer";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import { AttachmentUploader } from "./attachment-uploader";
import { QuickStart } from "./quick-start";
import {
  ConversationSidebar,
  type ConversationSummary,
} from "./conversation-sidebar";

const ACTIVE_SESSION_KEY = "erpai:active-session";

export function ChatWorkspace() {
  const supabase = supabaseBrowser();
  const { employee, accessToken } = useAuth();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    key: string;
    messageId: string;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastUserMessage = useRef<string>("");

  // ---- تهيئة الجلسة ----
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(ACTIVE_SESSION_KEY)
        : null;
    setSessionId(stored || newSessionId());
  }, []);

  useEffect(() => {
    if (sessionId) localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  }, [sessionId]);

  // ---- تحميل سجل المحادثات ----
  const loadHistory = useCallback(async () => {
    if (!employee) return;
    setHistoryLoading(true);
    const { data } = await supabase
      .from("conversation_logs")
      .select("session_id, message, role, service_code, created_at")
      .order("created_at", { ascending: false })
      .limit(400);

    const map = new Map<string, ConversationSummary>();
    for (const row of (data as ConversationLog[]) ?? []) {
      if (!map.has(row.session_id)) {
        map.set(row.session_id, {
          sessionId: row.session_id,
          title: row.message.slice(0, 60),
          serviceCode: row.service_code,
          updatedAt: row.created_at,
        });
      } else if (row.service_code && !map.get(row.session_id)!.serviceCode) {
        map.get(row.session_id)!.serviceCode = row.service_code;
      }
    }
    setConversations(Array.from(map.values()));
    setHistoryLoading(false);
  }, [employee, supabase]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ---- تحميل رسائل محادثة سابقة ----
  const openConversation = useCallback(
    async (sid: string) => {
      setSidebarOpen(false);
      setSessionId(sid);
      setPendingAttachment(null);
      setMessages([]);
      setTyping(true);
      const { data } = await supabase
        .from("conversation_logs")
        .select("id, message, role, created_at")
        .eq("session_id", sid)
        .order("created_at", { ascending: true });
      setTyping(false);
      setMessages(
        ((data as ConversationLog[]) ?? []).map((r) => ({
          id: r.id,
          role: r.role,
          text: r.message,
          createdAt: new Date(r.created_at).getTime(),
          status: "sent" as const,
        })),
      );
    },
    [supabase],
  );

  const startNewConversation = useCallback(() => {
    setSessionId(newSessionId());
    setMessages([]);
    setPendingAttachment(null);
    setSidebarOpen(false);
  }, []);

  // ---- الإرسال ----
  const send = useCallback(
    async (text: string, opts?: { silentUser?: boolean }) => {
      if (!sessionId || !accessToken || sending) return;
      lastUserMessage.current = text;
      setSending(true);
      setPendingAttachment(null);

      const userMsg: UiChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text,
        createdAt: Date.now(),
        status: "sending",
      };
      if (!opts?.silentUser) {
        setMessages((m) => [...m, userMsg]);
      }
      setTyping(true);

      try {
        const res = await sendChatMessage({
          sessionId,
          message: text,
          accessToken,
        });

        const assistantId = `a-${Date.now()}`;
        setMessages((m) => [
          ...m.map((x) =>
            x.id === userMsg.id ? { ...x, status: "sent" as const } : x,
          ),
          {
            id: assistantId,
            role: "assistant",
            text: res.reply,
            createdAt: Date.now(),
            status: "sent",
            attachmentRequest:
              res.needs_attachment && res.attachment_key
                ? { key: res.attachment_key }
                : undefined,
          },
        ]);

        if (res.needs_attachment && res.attachment_key) {
          setPendingAttachment({ key: res.attachment_key, messageId: assistantId });
        }

        // تحديث السجل الجانبي
        loadHistory();
      } catch (err) {
        setMessages((m) =>
          m.map((x) =>
            x.id === userMsg.id ? { ...x, status: "error" as const } : x,
          ),
        );
      } finally {
        setTyping(false);
        setSending(false);
      }
    },
    [sessionId, accessToken, sending, loadHistory],
  );

  const retryLast = useCallback(() => {
    setMessages((m) => m.filter((x) => x.status !== "error"));
    if (lastUserMessage.current) send(lastUserMessage.current);
  }, [send]);

  // ---- بعد رفع المرفق ----
  const handleAttachmentResolved = useCallback(
    (result: { filename: string; accepted: boolean; pending: boolean }) => {
      if (result.accepted) {
        send(`تم إرفاق الملف المطلوب: ${result.filename}`, { silentUser: true });
      } else if (result.pending) {
        setMessages((m) => [
          ...m,
          {
            id: `sys-${Date.now()}`,
            role: "assistant",
            text: `تم استلام الملف "${result.filename}". سيُراجَع من الإدارة المختصة، وسنُحدّث حالة طلبك بعد المراجعة.`,
            createdAt: Date.now(),
            status: "sent",
          },
        ]);
        setPendingAttachment(null);
      }
    },
    [send],
  );

  // ---- التمرير التلقائي ----
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const isEmpty = messages.length === 0 && !typing;

  return (
    <div className="flex h-dvh overflow-hidden bg-surface">
      <ConversationSidebar
        conversations={conversations}
        activeSessionId={sessionId}
        onSelect={openConversation}
        onNew={startNewConversation}
        loading={historyLoading}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* شريط علوي */}
        <header className="flex items-center justify-between border-b border-neutral-gray/15 bg-white/80 px-3 py-2.5 backdrop-blur-sm sm:px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-neutral-gray hover:bg-neutral-dark/5 lg:hidden"
              aria-label="القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={startNewConversation}
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-gray transition hover:bg-neutral-dark/5 hover:text-neutral-dark sm:flex lg:hidden"
            >
              <RotateCcw className="h-4 w-4" />
              محادثة جديدة
            </button>
            <h1 className="truncate text-sm font-semibold text-neutral-dark sm:text-base">
              المساعد الذكي للموارد البشرية
            </h1>
          </div>
          <UserMenu context="chat" />
        </header>

        {/* الرسائل */}
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          {isEmpty ? (
            <QuickStart employeeName={employee?.full_name} onPick={(p) => send(p)} />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-6 sm:px-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg}>
                  {msg.status === "error" && (
                    <button
                      onClick={retryLast}
                      className="flex items-center gap-1 rounded-lg bg-danger/10 px-2 py-1 text-xs font-medium text-danger transition hover:bg-danger/20"
                    >
                      <RotateCcw className="h-3 w-3" />
                      إعادة المحاولة
                    </button>
                  )}
                  {pendingAttachment?.messageId === msg.id && sessionId && (
                    <AttachmentUploader
                      attachmentKey={pendingAttachment.key}
                      sessionId={sessionId}
                      onResolved={handleAttachmentResolved}
                    />
                  )}
                </MessageBubble>
              ))}
              <AnimatePresence>{typing && <TypingIndicator />}</AnimatePresence>
            </div>
          )}
        </div>

        <Composer
          onSend={(t) => send(t)}
          disabled={sending || !accessToken || Boolean(pendingAttachment)}
          placeholder={
            pendingAttachment
              ? "أرفق الملف المطلوب أعلاه للمتابعة…"
              : "اكتب طلبك أو ردّك…"
          }
        />
      </div>
    </div>
  );
}
