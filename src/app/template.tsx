import { PageVeil } from "@/components/shell/page-veil";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageVeil>{children}</PageVeil>;
}
