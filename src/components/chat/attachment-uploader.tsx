"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { checkAttachment } from "@/lib/api";
import {
  ATTACHMENT_LABELS,
  ACCEPTED_UPLOAD_MIME,
  MAX_UPLOAD_BYTES,
} from "@/lib/constants";
import { fileToBase64 } from "@/lib/utils";
import { Button } from "@/components/ui/primitives";

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; filename: string }
  | { phase: "accepted"; filename: string }
  | { phase: "rejected"; filename: string; reason: string | null }
  | { phase: "pending"; filename: string };

export function AttachmentUploader({
  attachmentKey,
  sessionId,
  onResolved,
}: {
  attachmentKey: string;
  sessionId: string;
  onResolved: (result: {
    filename: string;
    accepted: boolean;
    pending: boolean;
  }) => void;
}) {
  const { accessToken } = useAuth();
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const label = ATTACHMENT_LABELS[attachmentKey] ?? "المستند المطلوب";

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_UPLOAD_MIME.includes(file.type)) {
        setState({
          phase: "rejected",
          filename: file.name,
          reason: "صيغة الملف غير مدعومة. المسموح: PDF أو صورة (JPG/PNG).",
        });
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setState({
          phase: "rejected",
          filename: file.name,
          reason: "حجم الملف يتجاوز 10 ميجابايت.",
        });
        return;
      }

      setState({ phase: "uploading", filename: file.name });
      try {
        const base64 = await fileToBase64(file);
        const res = await checkAttachment({
          sessionId,
          attachmentKey,
          accessToken: accessToken ?? "",
          fileBase64: base64,
          filename: file.name,
          mimeType: file.type,
        });

        if (res.pending) {
          setState({ phase: "pending", filename: file.name });
          onResolved({ filename: file.name, accepted: false, pending: true });
        } else if (res.accepted) {
          setState({ phase: "accepted", filename: file.name });
          onResolved({ filename: file.name, accepted: true, pending: false });
        } else {
          setState({
            phase: "rejected",
            filename: file.name,
            reason: res.reason,
          });
        }
      } catch {
        setState({
          phase: "rejected",
          filename: file.name,
          reason: "تعذّر رفع الملف. حاول مرة أخرى.",
        });
      }
    },
    [accessToken, attachmentKey, sessionId, onResolved],
  );

  const reset = () => setState({ phase: "idle" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-2xl border border-accent/30 bg-accent/5 p-4"
    >
      <p className="mb-3 text-sm font-semibold text-neutral-dark">
        📎 مطلوب إرفاق: {label}
      </p>

      {state.phase === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-neutral-gray/30 hover:border-primary/50 hover:bg-white"
          }`}
        >
          <UploadCloud className="h-7 w-7 text-primary" />
          <p className="text-sm font-medium text-neutral-dark">
            اسحب الملف هنا أو اضغط للاختيار
          </p>
          <p className="text-xs text-neutral-gray">
            PDF أو صورة — حتى 10 ميجابايت
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_UPLOAD_MIME.join(",")}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {state.phase === "uploading" && (
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-dark">
              {state.filename}
            </p>
            <p className="text-xs text-neutral-gray">جارٍ الرفع والمراجعة…</p>
          </div>
        </div>
      )}

      {state.phase === "accepted" && (
        <div className="flex items-center gap-3 rounded-xl bg-success/10 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-dark">
              {state.filename}
            </p>
            <p className="text-xs text-success">تم قبول المستند</p>
          </div>
        </div>
      )}

      {state.phase === "pending" && (
        <div className="flex items-center gap-3 rounded-xl bg-warning/10 px-4 py-3">
          <Clock className="h-5 w-5 text-warning" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-dark">
              {state.filename}
            </p>
            <p className="text-xs text-warning">
              تم استلام الملف — سيُراجَع يدويًا من الإدارة.
            </p>
          </div>
        </div>
      )}

      {state.phase === "rejected" && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl bg-danger/10 px-4 py-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-dark">
                {state.filename}
              </p>
              <p className="text-xs text-danger">
                {state.reason ?? "لم يُقبل المستند."}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={reset} className="w-full">
            <FileText className="h-4 w-4" />
            رفع ملف آخر
          </Button>
        </div>
      )}
    </motion.div>
  );
}
