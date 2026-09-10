import { AppGate } from "@/components/app-gate";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default function ChatPage() {
  return (
    <AppGate>
      <ChatWorkspace />
    </AppGate>
  );
}
