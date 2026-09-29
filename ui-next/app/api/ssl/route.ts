import { NextRequest, NextResponse } from 'next/server';
import tls from 'tls';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-simple';

export interface SSLCertificateInfo {
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

function probeSSLCertificate(host: string, port = 443, timeoutMs = 8000): Promise<SSLCertificateInfo> {
  return new Promise((resolve) => {
    const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
    
    let resolved = false;
    const socket = tls.connect(
      {
        host: cleanHost,
        port,
        servername: cleanHost,
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      () => {
        if (resolved) return;
        resolved = true;
        
        try {
          const cert = socket.getPeerCertificate(true);
          const isAuthorized = socket.authorized;
          socket.destroy();

          if (!cert || Object.keys(cert).length === 0) {
            resolve({
              host: cleanHost,
              port,
              valid: false,
              issuer: 'Unknown',
              subject: cleanHost,
              validFrom: '',
              validTo: '',
              daysRemaining: 0,
              subjectAltNames: [],
              fingerprint: '',
              serialNumber: '',
              error: 'No certificate presented by remote host',
            });
            return;
          }

          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          const altNames = cert.subjectaltname
            ? cert.subjectaltname.split(', ').map((s: string) => s.replace(/^DNS:/, ''))
            : [];

          const issuerStr = typeof cert.issuer === 'object' && cert.issuer
            ? cert.issuer.O || cert.issuer.CN || 'Unknown CA'
            : String(cert.issuer || 'Unknown CA');

          const subjectStr = typeof cert.subject === 'object' && cert.subject
            ? cert.subject.CN || cleanHost
            : String(cert.subject || cleanHost);

          resolve({
            host: cleanHost,
            port,
            valid: isAuthorized && daysRemaining > 0,
            issuer: issuerStr,
            subject: subjectStr,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysRemaining,
            subjectAltNames: altNames,
            fingerprint: cert.fingerprint || '',
            serialNumber: cert.serialNumber || '',
          });
        } catch {
          resolve({
            host: cleanHost,
            port,
            valid: false,
            issuer: 'Unknown',
            subject: cleanHost,
            validFrom: '',
            validTo: '',
            daysRemaining: 0,
            subjectAltNames: [],
            fingerprint: '',
            serialNumber: '',
            error: 'Failed to parse certificate',
          });
        }
      }
    );

    socket.on('error', () => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        host: cleanHost,
        port,
        valid: false,
        issuer: 'Unknown',
        subject: cleanHost,
        validFrom: '',
        validTo: '',
        daysRemaining: 0,
        subjectAltNames: [],
        fingerprint: '',
        serialNumber: '',
        // Deliberately generic: echoing the raw socket error would let callers
        // probe internal hosts/ports by distinguishing error classes.
        error: 'Unable to establish a TLS connection to the target host',
      });
    });

    socket.on('timeout', () => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        host: cleanHost,
        port,
        valid: false,
        issuer: 'Unknown',
        subject: cleanHost,
        validFrom: '',
        validTo: '',
        daysRemaining: 0,
        subjectAltNames: [],
        fingerprint: '',
        serialNumber: '',
        error: 'Connection timed out',
      });
    });
  });
}

// Default monitored domains for preview/demo
const DEFAULT_HOSTS = [
  'google.com',
  'github.com',
  'cloudflare.com',
  'grafana.com',
];

function parsePort(raw: string | null | undefined): number | null {
  const port = parseInt(raw || '443', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  return port;
}

async function requireSession(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  // SSL probing opens arbitrary server-side connections, so it must never be
  // callable anonymously (it would otherwise enable internal port scanning).
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target');
    const port = parsePort(searchParams.get('port'));

    if (port === null) {
      return NextResponse.json(
        { success: false, error: 'Port must be an integer between 1 and 65535' },
        { status: 400 }
      );
    }

    if (target) {
      const info = await probeSSLCertificate(target, port);
      return NextResponse.json({ success: true, certificate: info });
    }

    // Probe default list
    const results = await Promise.all(DEFAULT_HOSTS.map((h) => probeSSLCertificate(h)));
    return NextResponse.json({ success: true, certificates: results });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { target, port } = body;

    if (!target || typeof target !== 'string') {
      return NextResponse.json({ error: 'Missing target hostname' }, { status: 400 });
    }

    const parsedPort = parsePort(port ? String(port) : null);
    if (parsedPort === null) {
      return NextResponse.json(
        { error: 'Port must be an integer between 1 and 65535' },
        { status: 400 }
      );
    }

    const info = await probeSSLCertificate(target, parsedPort);
    return NextResponse.json({ success: true, certificate: info });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to inspect SSL certificate' },
      { status: 500 }
    );
  }
}
