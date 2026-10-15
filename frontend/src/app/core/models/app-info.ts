/**
 * Mirrors the backend DTOs in backend/AlQuran.Api/DTOs.
 * Keep these in step with the C# records - the /api/meta response is the
 * contract between the two halves of the project.
 */

export interface ExternalApiInfo {
  readonly key: string;
  readonly displayName: string;
  readonly purpose: string;
  readonly baseUrl: string;
  readonly docsUrl: string;
  readonly isFree: boolean;
  readonly requiresApiKey: boolean;
  readonly apiKeyConfigured: boolean;
  readonly enabled: boolean;
}

export interface AppInfo {
  readonly name: string;
  readonly version: string;
  readonly environment: string;
  readonly serverTimeUtc: string;
  readonly externalApis: readonly ExternalApiInfo[];
}

export interface UpstreamHealth {
  readonly key: string;
  readonly displayName: string;
  readonly healthy: boolean;
  readonly statusCode: number | null;
  readonly latencyMs: number;
  readonly message: string;
}

export interface UpstreamHealthReport {
  readonly status: 'Healthy' | 'Degraded';
  readonly checkedAtUtc: string;
  readonly upstreams: readonly UpstreamHealth[];
}

export interface Health {
  readonly status: string;
  readonly checkedAtUtc: string;
  readonly uptimeSeconds: number;
}
