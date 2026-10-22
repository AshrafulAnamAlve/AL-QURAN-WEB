import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { ADULT_DOMAINS_BLOCKLIST, SAFESEARCH_HOSTS_ENTRIES } from './blocklist';

const execAsync = promisify(exec);

const HOSTS_FILE_PATH = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
const SHIELD_START_MARKER = '# --- AL-QURAN HALAL SHIELD START ---';
const SHIELD_END_MARKER = '# --- AL-QURAN HALAL SHIELD END ---';

const FAMILY_DNS_PRIMARY = '1.1.1.3';
const FAMILY_DNS_SECONDARY = '1.0.0.3';

export interface SystemShieldStatus {
  enabled: boolean;
  dnsServers: string[];
  hostsActive: boolean;
  error?: string;
}

/**
 * Checks whether the computer is currently protected by either hosts blocking or family DNS.
 */
export async function getSystemShieldStatus(): Promise<SystemShieldStatus> {
  if (process.platform !== 'win32') {
    return { enabled: false, dnsServers: [], hostsActive: false, error: 'Only Windows is supported' };
  }

  try {
    let hostsActive = false;
    try {
      if (fs.existsSync(HOSTS_FILE_PATH)) {
        const content = fs.readFileSync(HOSTS_FILE_PATH, 'utf-8');
        hostsActive = content.includes(SHIELD_START_MARKER);
      }
    } catch {
      // Permission to read might be restricted in some corporate setups
    }

    let servers: string[] = [];
    try {
      const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses) -join ','"`;
      const { stdout } = await execAsync(cmd, { timeout: 6000 });
      servers = stdout
        .trim()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } catch {
      // Ignore
    }

    const dnsActive = servers.includes(FAMILY_DNS_PRIMARY);
    const enabled = hostsActive || dnsActive;

    return {
      enabled,
      dnsServers: servers,
      hostsActive,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[SystemShield] Failed to query shield status:', errorMsg);
    return { enabled: false, dnsServers: [], hostsActive: false, error: errorMsg };
  }
}

/**
 * Generates the hosts file entries content to insert.
 */
function generateShieldHostsBlock(): string {
  const lines: string[] = [
    SHIELD_START_MARKER,
    '# Al-Quran Halal Shield Protection',
    ...SAFESEARCH_HOSTS_ENTRIES,
    '',
    '# Top Adult & Gambling Domains Blocklist',
    ...ADULT_DOMAINS_BLOCKLIST.map((domain) => `0.0.0.0 ${domain}`),
    SHIELD_END_MARKER,
  ];
  return lines.join('\r\n');
}

/**
 * Enables or disables the system-wide protection across Windows.
 */
export async function setSystemShield(
  enabled: boolean,
): Promise<{ success: boolean; enabled: boolean; error?: string }> {
  if (process.platform !== 'win32') {
    return { success: false, enabled: false, error: 'Only Windows is supported' };
  }

  try {
    // Prepare temporary script file to avoid command-line quoting issues with large hosts content
    const tempDir = process.env.TEMP || 'C:\\Windows\\Temp';
    const scriptPath = path.join(tempDir, `alquran-shield-${Date.now()}.ps1`);

    let psScript = '';

    if (enabled) {
      const shieldBlock = generateShieldHostsBlock();
      // Base64 encode the shield block so it never gets corrupted in the PS script
      const encodedBlock = Buffer.from(shieldBlock, 'utf-8').toString('base64');

      psScript = `
$hostsPath = "${HOSTS_FILE_PATH}"
$existing = Get-Content -Path $hostsPath -Raw -ErrorAction SilentlyContinue
if (-not $existing) { $existing = "" }

# Remove existing block if present
$pattern = "(?s)\\r?\\n?# --- AL-QURAN HALAL SHIELD START ---.*?# --- AL-QURAN HALAL SHIELD END ---\\r?\\n?"
$cleaned = [regex]::Replace($existing, $pattern, "")

# Decode and append new shield block
$decodedBytes = [System.Convert]::FromBase64String("${encodedBlock}")
$newBlock = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
$finalContent = ($cleaned.TrimEnd() + "\`r\`n\`r\`n" + $newBlock + "\`r\`n").TrimStart()

Set-Content -Path $hostsPath -Value $finalContent -Encoding UTF8 -Force

# Also apply Family DNS on all active adapters
Get-NetAdapter | Where-Object Status -eq 'Up' | ForEach-Object {
  Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ServerAddresses ('${FAMILY_DNS_PRIMARY}','${FAMILY_DNS_SECONDARY}') -ErrorAction SilentlyContinue
}

Clear-DnsClientCache
`;
    } else {
      psScript = `
$hostsPath = "${HOSTS_FILE_PATH}"
$existing = Get-Content -Path $hostsPath -Raw -ErrorAction SilentlyContinue
if ($existing) {
  $pattern = "(?s)\\r?\\n?# --- AL-QURAN HALAL SHIELD START ---.*?# --- AL-QURAN HALAL SHIELD END ---\\r?\\n?"
  $cleaned = [regex]::Replace($existing, $pattern, "")
  Set-Content -Path $hostsPath -Value $cleaned.TrimEnd() -Encoding UTF8 -Force
}

# Reset DNS to automatic/DHCP
Get-NetAdapter | Where-Object Status -eq 'Up' | ForEach-Object {
  Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ResetServerAddresses -ErrorAction SilentlyContinue
}

Clear-DnsClientCache
`;
    }

    fs.writeFileSync(scriptPath, psScript, 'utf-8');

    // Execute script via PowerShell
    try {
      // Try direct execution first
      await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`, {
        timeout: 10000,
      });
    } catch {
      // If direct execution fails due to permissions, invoke with elevation UAC
      const elevatedCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList \\"-NoProfile -ExecutionPolicy Bypass -File \`\"${scriptPath}\`\"\\" -Wait -WindowStyle Hidden"`;
      await execAsync(elevatedCmd, { timeout: 25000 });
    } finally {
      // Clean up temp script file
      try {
        if (fs.existsSync(scriptPath)) {
          fs.unlinkSync(scriptPath);
        }
      } catch {
        // Ignore
      }
    }

    // Verify updated status
    const updated = await getSystemShieldStatus();
    return {
      success: updated.enabled === enabled,
      enabled: updated.enabled,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[SystemShield] Failed to toggle shield:', errorMsg);
    return { success: false, enabled: false, error: errorMsg };
  }
}
