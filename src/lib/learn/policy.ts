// The shapes the decision module answers with, and the small amount of reading
// a board does on top of them. Nothing here decides anything: every permission
// question is asked of the module, and these helpers only arrange the answer.

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

/**
 * Reads what somebody typed. A board has to tell text that is not JSON apart
 * from a policy the module refused, because only the second one is about cpak.
 */
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

/**
 * Names the permissions a policy actually carries: every key that is on, holds
 * a path, or sets a limit. A key written as false carries nothing, which is the
 * same thing a key nobody wrote carries.
 */
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

/**
 * The alias families a set of keys sets off. They are read from the module, so
 * a family added to cpak turns up here without this page being edited.
 */
export function reaching(named: string[], catalog: Catalog): AliasFamily[] {
  return catalog.aliases.filter((family) =>
    family.WhenAnyOf.some((key) => named.includes(key)),
  );
}

export function describe(key: string, catalog: Catalog): string {
  const permission = catalog.permissions.find((entry) => entry.key === key);
  return permission ? permission.description : "";
}

/** The keys written in an object, in the order they were written. */
export function keysOf(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.keys(value as Record<string, unknown>);
}
