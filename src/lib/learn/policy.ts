export type Host = {
  uid: number;
  home: string;
  env?: Record<string, string>;
  paths?: string[];
  sockets?: string[];
};

export type FilesystemPermission = { path: string; access: string };

export type Override = {
  filesystem?: FilesystemPermission[];
  [key: string]: unknown;
};

export type Permission = {
  key: string;
  field: string;
  kind: string;
  description: string;
  stated: boolean;
};

export type AliasFamily = { WhenAnyOf: string[]; AlsoHold: string[] };

export type Catalog = { permissions: Permission[]; aliases: AliasFamily[] };

export type Validation = {
  valid: boolean;
  manifestVersion: string;
  legacyFields: string[];
  stage?: "decode" | "rules";
  error?: string;
};

export type Policy = {
  source: "manifest" | "user";
  requested: Override;
  effective: Override;
  narrowed: string[];
  mounts: string[];
  shims: string[];
  host: Host;
  ceilingHolds?: string[];
};

export type MigrationChange = { field: string; became: string };

export type Migration = {
  manifest: Record<string, unknown>;
  manifestVersion: string;
  changes: MigrationChange[];
};

export type Typed<T> = { value?: T; error?: string };

export function parse<T>(text: string): Typed<T> {
  if (text.trim() === "") return {};
  try {
    return { value: JSON.parse(text) as T };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export function format(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function granted(policy: Override, catalog: Catalog): string[] {
  const keys: string[] = [];
  for (const permission of catalog.permissions) {
    if (carries(policy[permission.key])) keys.push(permission.key);
  }
  return keys;
}

function carries(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "number") return value > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    return Object.values(value).some(Boolean);
  }
  return false;
}

export function reaching(named: string[], catalog: Catalog): AliasFamily[] {
  return catalog.aliases.filter((family) =>
    family.WhenAnyOf.some((key) => named.includes(key)),
  );
}

export function describe(key: string, catalog: Catalog): string {
  const permission = catalog.permissions.find((entry) => entry.key === key);
  return permission ? permission.description : "";
}

export function keysOf(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.keys(value as Record<string, unknown>);
}
