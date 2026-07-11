'use client'

import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { addPerson, updateLastContacted, deletePerson } from '@/lib/actions/people-actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Briefcase, Clock, MessageSquare, UserPlus, Loader2, Trash2, Users, Mail, Phone, Check, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { useHighlightItem } from '@/hooks/use-highlight'
import type { Person } from '@/lib/types/database'

type NetworkPerson = Person & {
  context_notes: string | null;
  last_contacted: string | null;
};

function getInitials(name: string) {
  return name.split(' ').map((word) => word[0]).join('').substring(0, 2).toUpperCase();
}

function extractContactInfo(text: string | null) {
  if (!text) return { email: null, phone: null };

  const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/i;
  const phoneRegex = /(?:\+\d{1,3}\s?)?\(?\d{3,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{4}/;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
  };
}

function SmartCopyButton({ text, type }: { text: string; type: 'email' | 'phone' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  const Icon = type === 'email' ? Mail : Phone;

  return (
    <Button 
      type="button" 
      variant="ghost" 
      size="icon" 
      onClick={handleCopy}
      title={`Copy ${type}`} 
      className="h-8 w-8 text-primary/70 bg-primary/5 hover:bg-primary/15 hover:text-primary transition-colors"
    >
      {copied ? <Check className="size-4 text-success" /> : <Icon className="size-4" />}
    </Button>
  );
}

function TouchBaseButton({ personId, onTouchBase }: { personId: string; onTouchBase: (id: string) => Promise<void> }) {
  const [justTouched, setJustTouched] = useState(false);

  const handleClick = async () => {
    setJustTouched(true);
    
    await onTouchBase(personId);
    
    setTimeout(() => setJustTouched(false), 2000);
  };

  return (
    <Button 
      type="button" 
      variant="ghost" 
      size="icon" 
      title="Mark as contacted today"
      onClick={handleClick}
      className="h-8 w-8 text-primary/70 bg-primary/5 hover:bg-primary/15 hover:text-primary transition-colors"
    >
      {justTouched ? <Check className="size-4 text-success" /> : <UserCheck className="size-4" />}
    </Button>
  );
}

export default function NetworkPage() {
  const { data: network, isLoading } = useSWR<NetworkPerson[]>('/api/data/network', fetcher)
  useHighlightItem(isLoading);
  const handleCreate = async (formData: FormData) => {
    await addPerson(formData);
    mutate('/api/data/network'); 
  }

  const handleTouchBase = async (id: string) => {
    await updateLastContacted(id);
    mutate('/api/data/network'); 
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this connection?")) {
      await deletePerson(id);
      mutate('/api/data/network'); 
    }
  }

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>

  const people = network ?? [];

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-300 pt-2">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Network</h1>
            <p className="text-sm text-muted-foreground">Your personal CRM. Never forget a connection.</p>
          </div>

          <Card className="p-5 shadow-sm border-border/50">
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
                <Label htmlFor="role_company" className="text-xs">Role / Company (Optional)</Label>
                <Input id="role_company" name="role_company" placeholder="E.g., Founder @ Uni App" className="bg-secondary/20" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="context_notes" className="text-xs">Context & Notes (Optional)</Label>
                <textarea 
                  id="context_notes" 
                  name="context_notes" 
                  placeholder="Include an email or phone number here, and they will automatically become copyable buttons!" 
                  className="w-full rounded-md border border-input bg-secondary/20 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                ></textarea>
              </div>
              <Button type="submit" className="w-full">Add to CRM</Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {people.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl text-muted-foreground">
              <Users className="h-8 w-8 mb-2 opacity-20" /> 
              <p>Your network is empty.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {people.map((person) => {
                const { email, phone } = extractContactInfo(person.context_notes);

                return (
                  <Card key={person.id} id={person.id} className="p-5 flex flex-col gap-4 transition-colors hover:border-primary/50 shadow-sm border-border/50">
                    
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary mt-1">
                        {getInitials(person.name)}
                      </span>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-card-foreground text-lg">{person.name}</h3>
                        
                        {person.role_company && (
                          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground mt-0.5">
                            <Briefcase className="size-3 shrink-0" />
                            <span className="truncate">{person.role_company}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {person.context_notes && (
                      <div className="bg-secondary/20 rounded-md p-3 border border-border/30 ml-16">
                        <p className="flex gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="size-4 shrink-0 mt-0.5 text-primary/60" />
                          <span className="whitespace-pre-wrap leading-relaxed text-foreground/80">{person.context_notes}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                      
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Clock className="size-3.5" />
                        Last contacted: {person.last_contacted ? new Date(person.last_contacted).toLocaleDateString() : 'Never'}
                      </p>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {phone && <SmartCopyButton text={phone} type="phone" />}
                        {email && <SmartCopyButton text={email} type="email" />}

                        <TouchBaseButton personId={person.id} onTouchBase={handleTouchBase} />

                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          title="Delete connection"
                          onClick={() => handleDelete(person.id)}
                          className="h-8 w-8 text-destructive/70 bg-destructive/5 hover:bg-destructive/15 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
