'use client'

import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { addPerson, updateLastContacted } from '@/lib/actions/people-actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Briefcase, Clock, MessageSquare, UserPlus, Loader2, Users } from 'lucide-react'

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export default function NetworkPage() {
  const { data: network, isLoading } = useSWR('/api/data/network', fetcher)

  const handleCreate = async (formData: FormData) => {
    await addPerson(formData);
    mutate('/api/data/network'); // Instantly refresh the list!
    // Optional: Reset form here if you add a useRef to the form
  }

  const handleTouchBase = async (id: string) => {
    await updateLastContacted(id);
    mutate('/api/data/network'); // Instantly update the date!
  }

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>

  const people = network || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Network</h1>
        <p className="text-sm text-muted-foreground">Your personal CRM. Never forget a connection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Add Person Form */}
        <div className="lg:col-span-1">
          <Card className="p-5 sticky top-24 shadow-sm border-border/50">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Add Connection
            </h2>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Name</Label>
                <Input id="name" name="name" placeholder="E.g., Hamza Mubeen" required className="bg-secondary/20" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role_company" className="text-xs">Role / Company</Label>
                <Input id="role_company" name="role_company" placeholder="E.g., Founder @ Uni App" className="bg-secondary/20" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="context_notes" className="text-xs">Context & Notes</Label>
                <textarea 
                  id="context_notes" 
                  name="context_notes" 
                  placeholder="Where did you meet? What did you talk about?" 
                  className="w-full rounded-md border border-input bg-secondary/20 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                ></textarea>
              </div>
              <Button type="submit" className="w-full">Add to CRM</Button>
            </form>
          </Card>
        </div>

        {/* RIGHT: Contact Cards */}
        <div className="lg:col-span-2 space-y-4">
          {people.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl text-muted-foreground">
              <Users className="h-8 w-8 mb-2 opacity-20" /> {/* Make sure to import Users from lucide-react if used */}
              <p>Your network is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {people.map((person: any) => (
                <Card key={person.id} className="p-5 flex flex-col transition-colors hover:border-primary/50 shadow-sm border-border/50">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {getInitials(person.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-card-foreground">{person.name}</h3>
                      {person.role_company && (
                        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground mt-0.5">
                          <Briefcase className="size-3 shrink-0" />
                          <span className="truncate">{person.role_company}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {person.context_notes && (
                    <div className="flex-1 bg-secondary/20 rounded-md p-3 mb-4">
                      <p className="flex gap-1.5 text-xs text-muted-foreground">
                        <MessageSquare className="size-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-3">{person.context_notes}</span>
                      </p>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                    <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      Last contacted: {person.last_contacted ? new Date(person.last_contacted).toLocaleDateString() : 'Never'}
                    </p>
                    <form action={handleTouchBase.bind(null, person.id)}>
                      <Button type="submit" variant="ghost" size="sm" className="h-6 text-[10px] px-2 hover:text-primary">
                        Touch Base
                      </Button>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}