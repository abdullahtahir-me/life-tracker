import { getFinanceData } from '@/lib/services/finances'
// IMPORT THE NEW UNDO ACTION
import { addTransaction, markAsSettled, undoSettled } from '@/lib/actions/finance-actions'
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function money(n: number) {
  const sign = n < 0 ? '-' : ''
  return `${sign}Rs. ${Math.abs(n).toLocaleString()}`
}

export default async function FinancesPage() {
  // We now destructure BOTH activeTransactions and settledTransactions
  const { activeTransactions, settledTransactions, stats, debts } = await getFinanceData();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      {/* ... (Header and Stats Row remain the same) ... */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finances</h1>
        <p className="text-sm text-muted-foreground">Track your micro-loans and debts.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
         {/* ... Stats cards ... */}
         <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Owed To You</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-success">{money(stats.lent)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">You Owe Others</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-destructive">{money(stats.borrowed)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Net Balance</p>
          <p className={cn("mt-2 font-mono text-2xl font-semibold", stats.net >= 0 ? "text-success" : "text-destructive")}>
            {money(stats.net)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* ... (Left Column: Add Transaction & Who Owes Who remains the same) ... */}
        <div className="space-y-6">
           {/* Form section... */}
           <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold mb-4">Add Transaction</h2>
            <form action={addTransaction} className="space-y-3">
              <Input name="entity_name" placeholder="Person's Name (e.g., Ali)" required />
              <div className="flex gap-2">
                <Input name="amount" type="number" placeholder="Amount (PKR)" required className="flex-1" />
                <select name="transaction_type" required className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="lent">I Lent</option>
                  <option value="borrowed">I Borrowed</option>
                </select>
              </div>
              <Input name="description" placeholder="What was it for? (e.g., Lunch)" />
              <Button type="submit" className="w-full">Save Record</Button>
            </form>
          </section>

          {/* Debts list... */}
          <section className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Who Owes Who</h2>
            </header>
            <ul className="divide-y divide-border">
              {debts.length === 0 && <p className="p-4 text-sm text-muted-foreground">All settled up!</p>}
              {debts.map((debt) => {
                const owedToYou = debt.amount > 0
                return (
                  <li key={debt.name} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {debt.initials}
                    </span>
                    <p className="flex-1 truncate text-sm font-medium">{debt.name}</p>
                    <span className={cn('shrink-0 font-mono text-sm font-medium', owedToYou ? 'text-success' : 'text-destructive')}>
                      {money(debt.amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        {/* --- RIGHT COLUMN: TRANSACTIONS & HISTORY --- */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Active Transactions */}
          <section className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Unsettled Transactions</h2>
            </header>
            <ul className="divide-y divide-border">
              {activeTransactions.length === 0 && <p className="p-4 text-sm text-muted-foreground">No active transactions.</p>}
              
              {activeTransactions.map((tx) => {
                const income = tx.transaction_type === 'lent'
                return (
                  <li key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/40">
                    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', income ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                      {income ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
                    </span>
                    
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {income ? `Lent to ${tx.entity_name}` : `Borrowed from ${tx.entity_name}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.description} · {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <span className={cn('shrink-0 font-mono text-sm font-medium mr-4', income ? 'text-success' : 'text-destructive')}>
                      {money(Number(tx.amount))}
                    </span>

                    <form action={markAsSettled.bind(null, tx.id)}>
                      <Button type="submit" variant="outline" size="sm" className="h-8 text-xs">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Settle
                      </Button>
                    </form>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* --- NEW SECTION: SETTLED HISTORY --- */}
          {settledTransactions.length > 0 && (
            <section className="rounded-xl border border-border bg-card opacity-70 transition-opacity hover:opacity-100">
              <header className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Recent History (Settled)</h2>
              </header>
              <ul className="divide-y divide-border">
                {settledTransactions.map((tx) => {
                  const income = tx.transaction_type === 'lent'
                  return (
                    <li key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-muted-foreground line-through">
                          {income ? `Lent to ${tx.entity_name}` : `Borrowed from ${tx.entity_name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.description} · Settled
                        </p>
                      </div>
                      
                      <span className="shrink-0 font-mono text-sm font-medium mr-4 text-muted-foreground line-through">
                        {money(Number(tx.amount))}
                      </span>

                      {/* THE UNDO BUTTON */}
                      <form action={undoSettled.bind(null, tx.id)}>
                        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}