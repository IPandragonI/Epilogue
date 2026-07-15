import * as dns from 'node:dns/promises';
import * as net from 'node:net';
import { BadRequestException } from '@nestjs/common';

function isPrivateOrReservedIpv4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateOrReservedIp(ip: string): boolean {
  const type = net.isIP(ip);
  if (type === 4) return isPrivateOrReservedIpv4(ip);
  if (type === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::1') return true;
    if (lower.startsWith('fe80:')) return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    if (lower.startsWith('::ffff:')) {
      const v4 = lower.split(':').pop()!;
      if (net.isIP(v4) === 4) return isPrivateOrReservedIpv4(v4);
    }
    return false;
  }
  return true;
}

export async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new BadRequestException('URL invalide');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException(
      'Seules les URLs http/https sont autorisées',
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost') {
    throw new BadRequestException("Cette URL n'est pas autorisée");
  }

  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new BadRequestException("Cette URL n'est pas autorisée");
    }
    return parsed;
  }

  let addresses: string[];
  try {
    addresses = (await dns.lookup(hostname, { all: true })).map(
      (r) => r.address,
    );
  } catch {
    throw new BadRequestException("Impossible de résoudre le nom d'hôte");
  }

  if (addresses.length === 0 || addresses.some(isPrivateOrReservedIp)) {
    throw new BadRequestException("Cette URL n'est pas autorisée");
  }

  return parsed;
}
