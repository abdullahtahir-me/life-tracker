import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/app-sidebar"; 
import { Topbar } from "@/components/layout/site-header"; 
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickCaptureProvider } from "@/components/layout/quick-capture-provider";
import { SwrProvider } from "@/components/swr-provider";
import { Suspense } from "react";
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <SwrProvider>
        <QuickCaptureProvider>
          
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col h-full relative pb-16 md:pb-0">
            <Topbar />
            <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 relative">
              <Suspense fallback={null}>
                  {children}
                </Suspense>
            </main>
          </div>

          <MobileNav />
          
        </QuickCaptureProvider>
      </SwrProvider>
    </div>
  );
}
