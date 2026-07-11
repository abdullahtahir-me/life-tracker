'use client'

import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Users, Mail, Loader2 } from 'lucide-react'

import { fetcher } from '@/lib/fetcher'
import type { Person } from '@/lib/types/database'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export function RecentNetwork() {
  const { data, isLoading } = useSWR<Person[]>('/api/data/network', fetcher)
  const people = (data ?? []).slice(0, 4)

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Users className="h-4 w-4 text-muted-foreground" />
          Recent Network
        </h3>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : people.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground text-center p-4">
          <p className="text-sm">Your CRM is empty.</p>
          <p className="text-xs mt-1">Start adding startup founders, professors, and peers!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {people.map((person) => (
            <li key={person.id} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                {getInitials(person.name)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {person.name}
                </p>
                {person.role_company && (
                  <p className="truncate text-xs text-muted-foreground">
                    {person.role_company}
                  </p>
                )}
              </div>

              <button className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors">
                <Mail className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
