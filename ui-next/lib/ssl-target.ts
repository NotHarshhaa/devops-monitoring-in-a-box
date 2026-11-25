export interface ParsedSslTarget {
  host: string
  port: number
}

/**
 * Parses an SSL target string (URL, host, or host:port) plus an optional
 * explicit port override. Returns null if empty or if an embedded/explicit
 * port is outside 1..65535.
 */
export function parseSslTarget(
  rawTarget: string,
  explicitPort?: string | number | null
): ParsedSslTarget | null {
  const trimmed = rawTarget.trim()
  if (!trimmed) return null

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, '').split('/')[0]
  if (!withoutProtocol) return null

  let host = withoutProtocol
  let targetPort: number | undefined

  const colonIdx = withoutProtocol.lastIndexOf(':')
  if (colonIdx > 0 && !withoutProtocol.includes(']')) {
    const candidatePort = withoutProtocol.slice(colonIdx + 1)
    if (!/^\d+$/.test(candidatePort)) {
      return null
    }
    const numericPort = Number.parseInt(candidatePort, 10)
    if (!Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535) {
      return null
    }
    host = withoutProtocol.slice(0, colonIdx)
    targetPort = numericPort
  } else if (withoutProtocol.startsWith('[')) {
    const closeIdx = withoutProtocol.indexOf(']')
    if (closeIdx === -1) return null
    host = withoutProtocol.slice(1, closeIdx)
    const rest = withoutProtocol.slice(closeIdx + 1)
    if (rest) {
      if (!rest.startsWith(':')) return null
      const candidatePort = rest.slice(1)
      if (!/^\d+$/.test(candidatePort)) return null
      const numericPort = Number.parseInt(candidatePort, 10)
      if (!Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535) {
        return null
      }
      targetPort = numericPort
    }
  }

  if (!host) return null

  if (explicitPort !== undefined && explicitPort !== null && explicitPort !== '') {
    const numericPort =
      typeof explicitPort === 'number'
        ? explicitPort
        : Number.parseInt(String(explicitPort), 10)
    if (!Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535) {
      return null
    }
    return { host, port: numericPort }
  }

  return { host, port: targetPort ?? 443 }
}
