import { AppGate } from "@/components/app-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppGate requireAdmin>{children}</AppGate>;
}
