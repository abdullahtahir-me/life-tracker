'use client'

import { useEffect, useState, useRef } from 'react'
import { X, ListChecks, Users, Wallet, Loader2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Domain } from '@/lib/types/database'

import { quickCreateTask } from '@/lib/actions/task-actions'
import { quickCreatePerson } from '@/lib/actions/people-actions'
import { addTransaction } from '@/lib/actions/finance-actions' 

const types = [
  { key: 'task', label: 'Task', icon: ListChecks, shortcut: '1' },
  { key: 'contact', label: 'Contact', icon: Users, shortcut: '2' },
  { key: 'finance', label: 'Finance', icon: Wallet, shortcut: '3' },
]

export function QuickCapture({
  open, onClose, domains = [] 
}: {
  open: boolean; onClose: () => void; domains?: Domain[] 
}) {
  const [type, setType] = useState('task')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  
  const [txType, setTxType] = useState<'lent' | 'borrowed'>('lent')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        formRef.current?.reset();
        setTxType('lent');
        onClose();
      } else if (e.altKey && e.key === '1') {
        e.preventDefault();
        setType('task');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        setType('contact');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        setType('finance');
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (type === 'task') {
        formData.set('title', formData.get('inputValue') as string);
        await quickCreateTask(formData);
      } 
      else if (type === 'contact') {
        formData.set('name', formData.get('inputValue') as string);
        await quickCreatePerson(formData);
      }
      else if (type === 'finance') {
        formData.set('entity_name', formData.get('inputValue') as string);
        formData.set('transaction_type', txType); 
        await addTransaction(formData);
      }
      
      formRef.current?.reset();
      setTxType('lent');
      onClose();
    } catch (error) {
      console.error("Failed to quick capture:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-4 pt-28 backdrop-blur-sm" onClick={() => { formRef.current?.reset(); onClose(); }} role="presentation">
      <div role="dialog" onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-card-foreground">Quick Capture</p>
          <button type="button" onClick={() => { formRef.current?.reset(); onClose(); }} className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          
          {/* THE TABS */}
          <div className="flex flex-wrap gap-2 mb-1">
            {types.map((t) => {
              const Icon = t.icon
              const isActive = type === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                    isActive ? 'border-primary bg-primary/15 text-primary scale-105 shadow-sm' : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                  title={`Alt+${t.shortcut}`}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                  <span className={cn("text-[10px] ml-0.5 opacity-60", isActive ? "text-primary" : "text-muted-foreground")}>
                    {t.shortcut}
                  </span>
                </button>
              )
            })}
          </div>

          {/* --- 1. TASK INPUTS --- */}
          {type === 'task' && (
            <>
              {domains.length > 0 ? (
                <select name="domain_id" required className="w-full rounded-lg border border-input bg-secondary/30 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors cursor-pointer">
                  <option value="">Select Domain...</option>
                  {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              ) : (
                <p className="text-xs text-destructive">Please create a Domain in settings first.</p>
              )}
              
              <input
                autoFocus
                name="inputValue"
                placeholder="What do you need to do?"
                required
                className="w-full rounded-lg border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
              
              {/* NEW: Optional Due Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="due_date"
                  type="date"
                  className="w-full rounded-lg border border-input bg-secondary/30 py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors cursor-pointer [color-scheme:dark]"
                />
              </div>
              <p className="text-[10px] text-muted-foreground px-1 -mt-1">Leave date blank to default to Today.</p>
            </>
          )}

          {/* --- 2. CONTACT INPUTS --- */}
          {type === 'contact' && (
            <>
              <input
                autoFocus
                name="inputValue"
                placeholder="Person's Name (e.g., Hamza Mubeen)"
                required
                className="w-full rounded-lg border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
              <input
                name="role_company"
                placeholder="Role / Company (Optional)"
                className="w-full rounded-lg border border-input bg-secondary/30 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
              {/* NEW: Context Notes */}
              <textarea
                name="context_notes"
                placeholder="Where did you meet? What did you discuss? (Optional)"
                className="w-full min-h-[80px] resize-none rounded-lg border border-input bg-secondary/30 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
            </>
          )}

          {/* --- 3. FINANCE INPUTS --- */}
          {type === 'finance' && (
            <>
              {/* NEW: Sleek Segmented Control for Lent/Borrowed */}
              <div className="flex bg-secondary/40 p-1 rounded-lg border border-input">
                <button 
                  type="button" 
                  onClick={() => setTxType('lent')} 
                  className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-all", txType === 'lent' ? "bg-background shadow-sm text-success" : "text-muted-foreground hover:text-foreground")}
                >
                  I Lent
                </button>
                <button 
                  type="button" 
                  onClick={() => setTxType('borrowed')} 
                  className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-all", txType === 'borrowed' ? "bg-background shadow-sm text-destructive" : "text-muted-foreground hover:text-foreground")}
                >
                  I Borrowed
                </button>
              </div>

              <input
                autoFocus
                name="inputValue"
                placeholder="Person's Name (e.g., Ali)"
                required
                className="w-full rounded-lg border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
              <div className="flex gap-2">
                <input
                  name="amount"
                  type="number"
                  placeholder="Amount (PKR)"
                  required
                  className="flex-1 rounded-lg border border-input bg-secondary/30 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
                />
                <input
                  name="description"
                  placeholder="For what? e.g., Lunch (optional)"
                  
                  className="flex-[2] rounded-lg border border-input bg-secondary/30 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
                />
              </div>
            </>
          )}

          {/* SUBMIT BUTTON & FOOTER */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="rounded border border-border bg-secondary/50 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> to dismiss
            </p>
            <button
              type="submit"
              disabled={isSubmitting || (type === 'task' && domains.length === 0)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
