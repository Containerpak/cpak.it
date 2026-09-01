export const CORE_MODULE = {
  url: "/learn/cpak-core/cpak-core.wasm",
  digest: "a97ade20c11810567ed98ff17d32aa7f5756082f935ba862b8c047cb2f7e0445",
  bytes: 16773220,
};

export const CORE_RUNTIME = {
  url: "/learn/cpak-core/wasm_exec.js",
  digest: "0c949f4996f9a89698e4b5c586de32249c3b69b7baadb64d220073cc04acba14",
};

export type CoreCall =
  | "validateManifest"
  | "ungrantedPermissions"
  | "effectivePolicy"
  | "filesystemPlan"
  | "migrateManifest"
  | "desktopEntry"
  | "permissionCatalog";

export type CoreAnswer<T> =
  | { ok: true; result: T }
  | { ok: false; error: string };

export type CoreFault = "unsupported" | "download" | "digest" | "start";

export class CoreError extends Error {
  fault: CoreFault;

  constructor(fault: CoreFault, message: string) {
    super(message);
    this.name = "CoreError";
    this.fault = fault;
  }
}

export type Core = {
  version: string;
  ask<T>(call: CoreCall, request: unknown): CoreAnswer<T>;
};

type GoRuntime = {
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): Promise<void>;
};

let pending: Promise<Core> | null = null;

export function loadCore(): Promise<Core> {
  if (!pending) {
    pending = start().catch((error) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}

async function start(): Promise<Core> {
  if (typeof WebAssembly === "undefined" || !globalThis.crypto?.subtle) {
    throw new CoreError(
      "unsupported",
      "This browser cannot run WebAssembly, or cannot check a digest.",
    );
  }

  const runtime = await download(CORE_RUNTIME.url, CORE_RUNTIME.digest);
  const module = await download(CORE_MODULE.url, CORE_MODULE.digest);

  try {
    const webKit =
      navigator.userAgent.includes("AppleWebKit") &&
      !navigator.userAgent.includes("Chrome");
    const compiled = webKit
      ? new WebAssembly.Module(module)
      : await WebAssembly.compile(module);
    new Function(new TextDecoder().decode(runtime))();
    const go = new (globalThis as unknown as { Go: new () => GoRuntime }).Go();
    const instance = webKit
      ? new WebAssembly.Instance(compiled, go.importObject)
      : await WebAssembly.instantiate(compiled, go.importObject);
    void go.run(instance);
  } catch (error) {
    throw new CoreError("start", `The module did not start: ${reason(error)}`);
  }

  const api = await settled();
  return {
    version: String(api.version ?? "unknown"),
    ask<T>(call: CoreCall, request: unknown): CoreAnswer<T> {
      const decide = api[call];
      if (typeof decide !== "function") {
        return { ok: false, error: `This module has no ${call} call.` };
      }
      try {
        return JSON.parse(decide(JSON.stringify(request))) as CoreAnswer<T>;
      } catch (error) {
        return { ok: false, error: reason(error) };
      }
    },
  };
}

type CoreApi = Record<
  string,
  ((request: string) => string) | string | undefined
>;

async function settled(): Promise<CoreApi> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const api = (globalThis as unknown as { cpak?: CoreApi }).cpak;
    if (api && typeof api.effectivePolicy === "function") return api;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new CoreError("start", "The module started but published no calls.");
}

async function download(url: string, digest: string): Promise<ArrayBuffer> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new CoreError(
      "download",
      `${url} could not be fetched: ${reason(error)}`,
    );
  }
  if (!response.ok) {
    throw new CoreError("download", `${url} answered ${response.status}.`);
  }
  const bytes = await response.arrayBuffer();
  const found = hex(await crypto.subtle.digest("SHA-256", bytes));
  if (found !== digest) {
    throw new CoreError(
      "digest",
      `${url} is not the pinned file. Expected ${digest}, found ${found}.`,
    );
  }
  return bytes;
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function reason(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
