import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const FAMILY_DNS_PRIMARY = '1.1.1.3';
const FAMILY_DNS_SECONDARY = '1.0.0.3';
const CLEANBROWSING_PRIMARY = '185.228.168.168';

export interface SystemShieldStatus {
  enabled: boolean;
  dnsServers: string[];
  error?: string;
}

/**
 * Checks whether the computer's active network adapter is currently protected
 * by a family/adult-blocking DNS filter.
 */
export async function getSystemShieldStatus(): Promise<SystemShieldStatus> {
  if (process.platform !== 'win32') {
    return { enabled: false, dnsServers: [], error: 'Only Windows is supported' };
  }

  try {
    const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses) -join ','"`;
    const { stdout } = await execAsync(cmd, { timeout: 7000 });
    const servers = stdout
      .trim()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const isProtected =
      servers.includes(FAMILY_DNS_PRIMARY) || servers.includes(CLEANBROWSING_PRIMARY);

    return {
      enabled: isProtected,
      dnsServers: servers,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[SystemShield] Failed to query DNS status:', errorMsg);
    return { enabled: false, dnsServers: [], error: errorMsg };
  }
}

/**
 * Enables or disables the system-wide family DNS filter across all active network adapters on Windows.
 * Automatically requests elevation via standard Windows UAC if required.
 */
export async function setSystemShield(
  enabled: boolean,
): Promise<{ success: boolean; enabled: boolean; error?: string }> {
  if (process.platform !== 'win32') {
    return { success: false, enabled: false, error: 'Only Windows is supported' };
  }

  try {
    let script: string;

    if (enabled) {
      // Set active adapters to Cloudflare Family DNS (1.1.1.3, 1.0.0.3)
      script = `Get-NetAdapter | Where-Object Status -eq 'Up' | ForEach-Object { Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ServerAddresses ('${FAMILY_DNS_PRIMARY}','${FAMILY_DNS_SECONDARY}') }; Clear-DnsClientCache`;
    } else {
      // Reset active adapters to automatic/DHCP
      script = `Get-NetAdapter | Where-Object Status -eq 'Up' | ForEach-Object { Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ResetServerAddresses }; Clear-DnsClientCache`;
    }

    // Try executing directly first in case app is already running as Administrator
    try {
      await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${script}"`, {
        timeout: 8000,
      });
    } catch {
      // If direct execution fails with permission error, request elevation via Windows UAC
      const elevatedCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList \\"-NoProfile -ExecutionPolicy Bypass -Command \\\\\\"${script}\\\\\\"\\" -Wait -WindowStyle Hidden"`;
      await execAsync(elevatedCmd, { timeout: 25000 });
    }

    // Verify actual outcome
    const updated = await getSystemShieldStatus();
    return {
      success: updated.enabled === enabled,
      enabled: updated.enabled,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[SystemShield] Failed to apply shield state:', errorMsg);
    return { success: false, enabled: false, error: errorMsg };
  }
}
