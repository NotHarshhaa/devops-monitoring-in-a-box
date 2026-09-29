'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  VolumeMute01Icon,
  Loading03Icon,
  RefreshIcon,
  Delete02Icon,
  PlusSignIcon,
  AlertCircleIcon,
  CheckmarkCircle01Icon
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { alertmanagerAPI, type AlertmanagerSilence } from '@/lib/alertmanager-api'
import { toast } from '@/hooks/use-toast'

interface AlertForSilence {
  labels: Record<string, string>
  fingerprint?: string
}

const DURATIONS = [
  { label: '30 minutes', hours: 0.5 },
  { label: '1 hour', hours: 1 },
  { label: '2 hours', hours: 2 },
  { label: '8 hours', hours: 8 },
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 168 },
]

/**
 * Silence management for the alerts page: list active silences (with expire)
 * and create new ones with a custom duration. All calls go through the
 * authenticated Alertmanager proxy; mutations require a write role.
 */
export function SilenceManager({
  open,
  onOpenChange,
  alert,
  onSilencesChanged,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided the dialog opens in create mode pre-filled for this alert */
  alert?: AlertForSilence
  onSilencesChanged?: () => void
}) {
  const { data: session } = useSession()
  const [view, setView] = useState<'list' | 'create'>('list')

  const [silences, setSilences] = useState<AlertmanagerSilence[]>([])
  const [silencesLoading, setSilencesLoading] = useState(false)
  const [silencesError, setSilencesError] = useState<string | null>(null)
  const [expiringId, setExpiringId] = useState<string | null>(null)

  const [alertname, setAlertname] = useState('')
  const [instance, setInstance] = useState('')
  const [durationHours, setDurationHours] = useState('2')
  const [comment, setComment] = useState('Silenced from the monitoring UI')
  const [submitting, setSubmitting] = useState(false)

  const activeSilenceCount = silences.filter((s) => s.status?.state !== 'expired').length

  const fetchSilences = useCallback(async () => {
    setSilencesLoading(true)
    setSilencesError(null)
    try {
      const data = await alertmanagerAPI.getSilences()
      setSilences(data)
    } catch (err) {
      setSilencesError(err instanceof Error ? err.message : 'Failed to load silences')
    } finally {
      setSilencesLoading(false)
    }
  }, [])

  // Open in create mode when launched from a specific alert
  useEffect(() => {
    if (!open) return
    if (alert) {
      setView('create')
      setAlertname(alertmanagerAPI.extractAlertName(alert.labels))
      setInstance(alert.labels?.instance ?? '')
    } else {
      setView('list')
      fetchSilences()
    }
  }, [open, alert, fetchSilences])

  const handleExpire = async (silenceId: string) => {
    setExpiringId(silenceId)
    try {
      await alertmanagerAPI.deleteSilence(silenceId)
      toast({
        title: 'Silence expired',
        description: 'The silence has been removed and alerts can fire again.',
      })
      await fetchSilences()
      onSilencesChanged?.()
    } catch (err) {
      toast({
        title: 'Failed to expire silence',
        description: err instanceof Error ? err.message : 'Could not reach Alertmanager.',
        variant: 'destructive',
      })
    } finally {
      setExpiringId(null)
    }
  }

  const handleCreate = async () => {
    if (!alertname.trim()) {
      toast({
        title: 'Alert name required',
        description: 'Enter an alertname matcher for the silence.',
        variant: 'destructive',
      })
      return
    }

    const matchers: Array<{ name: string; value: string; isRegex: boolean }> = [
      { name: 'alertname', value: alertname.trim(), isRegex: false },
    ]
    if (instance.trim()) {
      matchers.push({ name: 'instance', value: instance.trim(), isRegex: false })
    }

    const startsAt = new Date()
    const endsAt = new Date(startsAt.getTime() + parseFloat(durationHours) * 60 * 60 * 1000)

    setSubmitting(true)
    try {
      await alertmanagerAPI.createSilence({
        matchers,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        createdBy: session?.user?.email || 'devops-monitoring-ui',
        comment: comment.trim() || 'Silenced from the monitoring UI',
      })
      toast({
        title: 'Silence created',
        description: `Silenced ${alertname.trim()} for ${DURATIONS.find((d) => d.hours === parseFloat(durationHours))?.label ?? durationHours}.`,
      })
      onSilencesChanged?.()
      setView('list')
      fetchSilences()
    } catch (err) {
      toast({
        title: 'Failed to create silence',
        description: err instanceof Error ? err.message : 'Could not reach Alertmanager.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatEndsAt = (value: string) => {
    const date = new Date(value)
    const diffMs = date.getTime() - Date.now()
    if (diffMs <= 0) return 'expired'
    const minutes = Math.floor(diffMs / 60000)
    if (minutes < 60) return `in ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `in ${hours}h ${minutes % 60}m`
    return `in ${Math.floor(hours / 24)}d ${hours % 24}h`
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={
        <span className="flex items-center gap-2">
          <HugeiconsIcon icon={VolumeMute01Icon} className="size-4" />
          {view === 'create' ? 'Create Silence' : 'Manage Silences'}
        </span>
      }
      description={
        view === 'create'
          ? 'Mute matching alerts in Alertmanager for a fixed duration.'
          : `${activeSilenceCount} active silence${activeSilenceCount === 1 ? '' : 's'}`
      }
      className="max-w-xl"
    >
      {view === 'list' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setView('create')}>
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              New Silence
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={fetchSilences}
              disabled={silencesLoading}
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                className={`size-3.5 ${silencesLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>

          {silencesLoading && silences.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
              Loading silences…
            </div>
          ) : silencesError ? (
            <div className="py-6 text-center text-muted-foreground">
              <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto mb-2 size-7" />
              <p className="text-sm">{silencesError}</p>
              <p className="mt-1 text-xs">
                Check Alertmanager&apos;s status on the Services page.
              </p>
            </div>
          ) : activeSilenceCount === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mx-auto mb-2 size-7" />
              <p className="text-sm">No active silences. Alerts will fire normally.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {silences
                .filter((s) => s.status?.state !== 'expired')
                .map((silence) => (
                  <div key={silence.id} className="border border-border bg-muted/40 p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      {(silence.matchers ?? []).map((matcher, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-[10px]">
                          {matcher.name}={matcher.value}
                          {matcher.isRegex ? '~' : ''}
                        </Badge>
                      ))}
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        {silence.status?.state}
                      </Badge>
                    </div>
                    {silence.comment && (
                      <p className="mb-1 text-xs text-foreground">{silence.comment}</p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        By {silence.createdBy || 'unknown'} · expires {formatEndsAt(silence.endsAt)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => handleExpire(silence.id)}
                        disabled={expiringId === silence.id}
                      >
                        {expiringId === silence.id ? (
                          <HugeiconsIcon icon={Loading03Icon} className="size-3 animate-spin" />
                        ) : (
                          <HugeiconsIcon icon={Delete02Icon} className="size-3" />
                        )}
                        Expire
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="silence-alertname">Alert name matcher</Label>
            <Input
              id="silence-alertname"
              placeholder="HighCPUUsage"
              value={alertname}
              onChange={(e) => setAlertname(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Alerts whose alertname label equals this value are silenced.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="silence-instance">Instance (optional)</Label>
            <Input
              id="silence-instance"
              placeholder="Leave empty to match every instance"
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={durationHours} onValueChange={setDurationHours}>
              <SelectTrigger className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((duration) => (
                  <SelectItem key={duration.hours} value={String(duration.hours)}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="silence-comment">Comment</Label>
            <Input
              id="silence-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (alert ? onOpenChange(false) : setView('list'))}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting} className="gap-2">
              {submitting ? (
                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
              ) : (
                <HugeiconsIcon icon={VolumeMute01Icon} className="size-4" />
              )}
              Create Silence
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
