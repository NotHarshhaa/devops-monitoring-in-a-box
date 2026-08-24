"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Shield01Icon,
  CheckmarkCircle01Icon,
  Alert02Icon,
  CancelCircleIcon,
  RefreshIcon,
  PlusSignIcon,
  Loading03Icon,
  GlobeIcon,
  Clock01Icon,
  LockIcon
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

interface SSLCertificateInfo {
  host: string;
  port: number;
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  subjectAltNames: string[];
  fingerprint: string;
  serialNumber: string;
  error?: string;
}

export function SSLMonitor() {
  const [certificates, setCertificates] = useState<SSLCertificateInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newHost, setNewHost] = useState("")
  const [isProbing, setIsProbing] = useState(false)

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/ssl")
      const data = await res.json()
      if (data.success && data.certificates) {
        setCertificates(data.certificates)
      }
    } catch (err: any) {
      toast({
        title: "SSL Probe Error",
        description: err.message || "Failed to fetch SSL certificate status",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const handleAddHost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHost.trim()) return

    try {
      setIsProbing(true)
      const res = await fetch("/api/ssl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: newHost.trim() })
      })
      const data = await res.json()
      if (data.success && data.certificate) {
        setCertificates((prev) => {
          const filtered = prev.filter((c) => c.host !== data.certificate.host)
          return [data.certificate, ...filtered]
        })
        setNewHost("")
        toast({
          title: "Certificate Inspected",
          description: `SSL certificate for ${data.certificate.host} probed successfully.`
        })
      } else {
        toast({
          title: "Probe Failed",
          description: data.error || "Failed to inspect certificate",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      toast({
        title: "Probe Failed",
        description: err.message || "Connection error",
        variant: "destructive"
      })
    } finally {
      setIsProbing(false)
    }
  }

  const getStatusBadge = (cert: SSLCertificateInfo) => {
    if (!cert.valid || cert.error) {
      return (
        <Badge variant="outline" className="border-destructive text-destructive gap-1 bg-destructive/10">
          <HugeiconsIcon icon={CancelCircleIcon} className="size-3" />
          Invalid / Expired
        </Badge>
      )
    }
    if (cert.daysRemaining <= 14) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500 gap-1 bg-amber-500/10">
          <HugeiconsIcon icon={Alert02Icon} className="size-3" />
          Expiring in {cert.daysRemaining}d
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-emerald-500 text-emerald-500 gap-1 bg-emerald-500/10">
        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3" />
        Valid ({cert.daysRemaining} days)
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Probe form */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={LockIcon} className="size-5" />
            SSL/TLS Certificate Expiry & Health Tracker
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time certificate expiration, SAN validation, and cipher verification across endpoints.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCertificates}
            disabled={isLoading}
            className="border-border hover:bg-muted gap-2"
          >
            <HugeiconsIcon icon={RefreshIcon} className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Quick Add Domain Form */}
      <Card className="border border-border bg-card">
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleAddHost} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <HugeiconsIcon icon={GlobeIcon} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Enter domain to inspect (e.g. api.yourcompany.com)"
                value={newHost}
                onChange={(e) => setNewHost(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
            <Button
              type="submit"
              disabled={isProbing || !newHost.trim()}
              className="w-full sm:w-auto gap-2 bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              {isProbing ? (
                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
              ) : (
                <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
              )}
              Probe Certificate
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 border border-border bg-card">
          <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <motion.div
              key={cert.host}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border border-border bg-card h-full flex flex-col justify-between">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-muted border border-border flex items-center justify-center">
                        <HugeiconsIcon icon={Shield01Icon} className="size-4 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-bold truncate text-foreground">
                          {cert.host}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground truncate mt-0.5">
                          Port {cert.port}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(cert)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                    <div>
                      <span className="text-muted-foreground block">Issuer CA</span>
                      <span className="font-semibold text-foreground truncate block mt-0.5" title={cert.issuer}>
                        {cert.issuer}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Days Remaining</span>
                      <span className={`font-semibold block mt-0.5 ${
                        cert.daysRemaining <= 14 ? 'text-destructive' : 'text-foreground'
                      }`}>
                        {cert.daysRemaining} days
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Valid From</span>
                      <span className="text-foreground block mt-0.5">
                        {cert.validFrom ? new Date(cert.validFrom).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Expires On</span>
                      <span className="text-foreground block mt-0.5">
                        {cert.validTo ? new Date(cert.validTo).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {cert.subjectAltNames && cert.subjectAltNames.length > 0 && (
                    <div className="text-xs border-t border-border pt-2">
                      <span className="text-muted-foreground block mb-1">Subject Alternative Names ({cert.subjectAltNames.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {cert.subjectAltNames.slice(0, 3).map((san, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 border border-border">
                            {san}
                          </Badge>
                        ))}
                        {cert.subjectAltNames.length > 3 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{cert.subjectAltNames.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {cert.error && (
                    <div className="p-2 border border-destructive/30 bg-destructive/5 text-destructive text-xs">
                      {cert.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
