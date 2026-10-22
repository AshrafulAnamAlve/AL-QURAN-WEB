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
    const tempDir = process.env.TEMP || 'C:\\Windows\\Temp';
    const scriptPath = path.join(tempDir, `alquran-shield-${Date.now()}.ps1`);
    const shieldBlock = generateShieldHostsBlock();
    const encodedBlock = Buffer.from(shieldBlock, 'utf-8').toString('base64');

    const psScript = `
# Al-Quran Halal Shield - Elevated Execution
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    try {
        $p = Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \`"$PSCommandPath\`"" -Wait -PassThru
        exit $p.ExitCode
    } catch {
        exit 1223
    }
}

$hostsPath = "${HOSTS_FILE_PATH}"
if (Test-Path $hostsPath) {
    $item = Get-Item $hostsPath
    if ($item.IsReadOnly) {
        $item.IsReadOnly = $false
    }
}

$existing = Get-Content -Path $hostsPath -Raw -ErrorAction SilentlyContinue
if (-not $existing) { $existing = "" }

$pattern = "(?s)\\r?\\n?# --- AL-QURAN HALAL SHIELD START ---.*?# --- AL-QURAN HALAL SHIELD END ---\\r?\\n?"
$cleaned = [regex]::Replace($existing, $pattern, "")

${
  enabled
    ? `
# Enable Shield: Write hosts entries and Family DNS
$decodedBytes = [System.Convert]::FromBase64String("${encodedBlock}")
$newBlock = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
$finalContent = ($cleaned.TrimEnd() + "\`r\`n\`r\`n" + $newBlock + "\`r\`n").TrimStart()
Set-Content -Path $hostsPath -Value $finalContent -Encoding UTF8 -Force

Get-NetAdapter | Where-Object Status -eq 'Up' | ForEach-Object {
    Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ServerAddresses ('${FAMILY_DNS_PRIMARY}','${FAMILY_DNS_SECONDARY}') -ErrorAction SilentlyContinue
}
`
    : `
# Disable Shield: Restore hosts and reset DNS
Set-Content -Path $hostsPath -Value $cleaned.TrimEnd() -Encoding UTF8 -Force

Get-NetAdapter | Where-Object Status -eq 'Up' | ForEach-Object {
    Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ResetServerAddresses -ErrorAction SilentlyContinue
}
`
}

Clear-DnsClientCache -ErrorAction SilentlyContinue
ipconfig /flushdns | Out-Null
exit 0
`;

    fs.writeFileSync(scriptPath, psScript, 'utf-8');

    // Execute script via PowerShell (handles self-elevation UAC prompt)
    let userCancelled = false;
    try {
      await execAsync(`powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`, {
        timeout: 45000,
      });
    } catch (execErr: unknown) {
      const errStr = String(execErr);
      if (errStr.includes('1223') || errStr.includes('canceled') || (execErr as { code?: number })?.code === 1223) {
        userCancelled = true;
      }
      console.warn('[SystemShield] Script execution note:', errStr);
    } finally {
      // Clean up temp script file after child process has completed
      setTimeout(() => {
        try {
          if (fs.existsSync(scriptPath)) {
            fs.unlinkSync(scriptPath);
          }
        } catch {
          // Ignore
        }
      }, 5000);
    }

    if (userCancelled) {
      const current = await getSystemShieldStatus();
      return {
        success: false,
        enabled: current.enabled,
        error: 'Windows Administrator (UAC) permission was not granted.',
      };
    }

    // Small delay to allow DNS/hosts changes to settle
    await new Promise((resolve) => setTimeout(resolve, 800));

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
