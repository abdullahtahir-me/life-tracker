import { getDomains } from '@/lib/services/domains'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, Brain, BellDot, RefreshCcw } from 'lucide-react'
import { DomainManager } from '@/components/settings/domain-manager'

export default async function SettingsPage() {
  const domains = await getDomains();

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-10">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your core configuration and external integrations.</p>
      </div>

      <DomainManager domains={domains} />

      <div className="space-y-4 pt-6 border-t border-border/50">
        <div>
          <h2 className="text-lg font-semibold px-1">Integrations & Pipelines</h2>
          <p className="text-xs text-muted-foreground px-1">Connect third-party services and test API webhooks.</p>
        </div>

        <Card className="border border-border/50 shadow-sm overflow-hidden">
          <div className="divide-y divide-border/50">
            
            <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
                  <CalendarDays className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Google Calendar Sync</h3>
                  <p className="text-xs text-muted-foreground">One-way push for tasks with due dates.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">Disconnected</span>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-lg">
                  <Brain className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">AI Engine (Claude / OpenAI)</h3>
                  <p className="text-xs text-muted-foreground">Processes natural language quick capture.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">
                  <span className="size-1.5 rounded-full bg-success animate-pulse" /> Active
                </span>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCcw className="size-3" /> Test Connection
                </Button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-lg">
                  <BellDot className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Pushover Notifications</h3>
                  <p className="text-xs text-muted-foreground">Native iOS/Android alerts for urgent tasks.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">API Key Missing</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>

          </div>
        </Card>
      </div>

    </div>
  )
}
