// Everything the Learn account keeps lives here, behind one narrow interface.
//
// On Cloudflare the rows are in D1, bound as LEARN_DB. D1 was chosen over KV
// because two of this feature's promises are consistency promises: deleting an
// account has to be observable on the next request, and a verification page
// must never serve a credential that was just superseded. KV is eventually
// consistent and would make both of those "usually true".
//
// When the binding is missing the store falls back to process memory so the
// dev server works with no Cloudflare account. That store is real, but it is
// not durable: it is emptied every time the server restarts, and the account
// page says so.

export type Provider = "github" | "local";

export type Account = {
  key: string;
  provider: Provider;
  handle: string;
  avatar: string;
  createdAt: string;
  seenAt: string;
};

export type Completion = {
  lesson: string;
  title: string;
  course: string;
  courseTitle: string;
  courseTotal: number;
  completedAt: string;
};

export type Credential = {
  code: string;
  account: string;
  provider: Provider;
  handle: string;
  exam: string;
  title: string;
  result: string;
  issuedAt: string;
  expiresAt: string;
  supersededBy: string | null;
  /**
   * Where this credential sits in the published status list. Allocated once,
   * never reused, so a position that has been revoked stays revoked.
   */
  statusIndex: number;
  /**
   * The signed form, when a signing key was configured at the moment it was
   * issued. Empty means the code is the only proof there is, and every page
   * that shows the credential says which of the two it is.
   */
  token: string;
};

export type Erased = {
  accounts: number;
  sessions: number;
  completions: number;
};

// The slice of D1 this code uses. Typed here rather than pulled in from
// @cloudflare/workers-types so the project keeps its current dependencies.
type Statement = {
  bind: (...values: unknown[]) => Statement;
  first: <T>() => Promise<T | null>;
  all: <T>() => Promise<{ results: T[] }>;
  run: () => Promise<{ meta: { changes: number } }>;
};

export type Database = {
  prepare: (query: string) => Statement;
  batch: (statements: Statement[]) => Promise<unknown>;
};

export type Store = {
  durable: boolean;
  saveAccount: (account: Account) => Promise<void>;
  readAccount: (key: string) => Promise<Account | null>;
  openSession: (
    token: string,
    account: string,
    expiresAt: string,
  ) => Promise<void>;
  readSession: (
    token: string,
  ) => Promise<{ account: string; expiresAt: string } | null>;
  closeSession: (token: string) => Promise<void>;
  recordCompletion: (account: string, entry: Completion) => Promise<void>;
  readCompletions: (account: string) => Promise<Completion[]>;
  writeCredential: (entry: Credential) => Promise<void>;
  supersede: (code: string, by: string) => Promise<void>;
  readCredential: (code: string) => Promise<Credential | null>;
  readCredentials: (account: string) => Promise<Credential[]>;
  /** The next unused position in the status list. */
  nextStatusIndex: () => Promise<number>;
  /** Every position whose credential no longer stands. */
  revokedStatusIndexes: () => Promise<number[]>;
  erase: (account: string) => Promise<Erased>;
};

const SCHEMA = [
  `create table if not exists accounts (
    key text primary key,
    provider text not null,
    handle text not null,
    avatar text not null default '',
    created_at text not null,
    seen_at text not null
  )`,
  `create table if not exists sessions (
    token text primary key,
    account text not null,
    expires_at text not null
  )`,
  `create index if not exists sessions_account on sessions (account)`,
  `create table if not exists completions (
    account text not null,
    lesson text not null,
    title text not null,
    course text not null,
    course_title text not null,
    course_total integer not null,
    completed_at text not null,
    primary key (account, lesson)
  )`,
  `create table if not exists credentials (
    code text primary key,
    account text not null,
    provider text not null,
    handle text not null,
    exam text not null,
    title text not null,
    result text not null,
    issued_at text not null,
    expires_at text not null,
    superseded_by text,
    status_index integer not null default 0,
    token text not null default ''
  )`,
  `create index if not exists credentials_account on credentials (account)`,
  `create unique index if not exists credentials_status on credentials (status_index)`,
  // One row per counter. A status list position may never be handed out
  // twice: reusing one would un-revoke a credential somebody else is holding.
  `create table if not exists counters (
    name text primary key,
    value integer not null
  )`,
];

type AccountRow = {
  key: string;
  provider: string;
  handle: string;
  avatar: string;
  created_at: string;
  seen_at: string;
};

type CompletionRow = {
  lesson: string;
  title: string;
  course: string;
  course_title: string;
  course_total: number;
  completed_at: string;
};

type CredentialRow = {
  code: string;
  account: string;
  provider: string;
  handle: string;
  exam: string;
  title: string;
  result: string;
  issued_at: string;
  expires_at: string;
  superseded_by: string | null;
  status_index: number;
  token: string;
};

function asProvider(value: string): Provider {
  return value === "local" ? "local" : "github";
}

function toAccount(row: AccountRow): Account {
  return {
    key: row.key,
    provider: asProvider(row.provider),
    handle: row.handle,
    avatar: row.avatar,
    createdAt: row.created_at,
    seenAt: row.seen_at,
  };
}

function toCompletion(row: CompletionRow): Completion {
  return {
    lesson: row.lesson,
    title: row.title,
    course: row.course,
    courseTitle: row.course_title,
    courseTotal: row.course_total,
    completedAt: row.completed_at,
  };
}

function toCredential(row: CredentialRow): Credential {
  return {
    code: row.code,
    account: row.account,
    provider: asProvider(row.provider),
    handle: row.handle,
    exam: row.exam,
    title: row.title,
    result: row.result,
    issuedAt: row.issued_at,
    expiresAt: row.expires_at,
    supersededBy: row.superseded_by,
    statusIndex: row.status_index ?? 0,
    token: row.token ?? "",
  };
}

// The tables are created on demand, once per isolate, so a fresh D1 database
// needs no migration step before the first request works.
const prepared = new WeakSet<Database>();

async function ready(db: Database) {
  if (prepared.has(db)) return;
  await db.batch(SCHEMA.map((statement) => db.prepare(statement)));
  prepared.add(db);
}

function onD1(db: Database): Store {
  return {
    durable: true,

    async saveAccount(account) {
      await ready(db);
      await db
        .prepare(
          `insert into accounts (key, provider, handle, avatar, created_at, seen_at)
           values (?, ?, ?, ?, ?, ?)
           on conflict (key) do update set handle = excluded.handle,
             avatar = excluded.avatar, seen_at = excluded.seen_at`,
        )
        .bind(
          account.key,
          account.provider,
          account.handle,
          account.avatar,
          account.createdAt,
          account.seenAt,
        )
        .run();
    },

    async readAccount(key) {
      await ready(db);
      const row = await db
        .prepare(`select * from accounts where key = ?`)
        .bind(key)
        .first<AccountRow>();
      return row ? toAccount(row) : null;
    },

    async openSession(token, account, expiresAt) {
      await ready(db);
      await db
        .prepare(
          `insert into sessions (token, account, expires_at) values (?, ?, ?)`,
        )
        .bind(token, account, expiresAt)
        .run();
    },

    async readSession(token) {
      await ready(db);
      const row = await db
        .prepare(`select account, expires_at from sessions where token = ?`)
        .bind(token)
        .first<{ account: string; expires_at: string }>();
      return row ? { account: row.account, expiresAt: row.expires_at } : null;
    },

    async closeSession(token) {
      await ready(db);
      await db
        .prepare(`delete from sessions where token = ?`)
        .bind(token)
        .run();
    },

    async recordCompletion(account, entry) {
      await ready(db);
      await db
        .prepare(
          `insert into completions
             (account, lesson, title, course, course_title, course_total, completed_at)
           values (?, ?, ?, ?, ?, ?, ?)
           on conflict (account, lesson) do update set title = excluded.title,
             course = excluded.course, course_title = excluded.course_title,
             course_total = excluded.course_total`,
        )
        .bind(
          account,
          entry.lesson,
          entry.title,
          entry.course,
          entry.courseTitle,
          entry.courseTotal,
          entry.completedAt,
        )
        .run();
    },

    async readCompletions(account) {
      await ready(db);
      const rows = await db
        .prepare(
          `select * from completions where account = ? order by completed_at`,
        )
        .bind(account)
        .all<CompletionRow>();
      return rows.results.map(toCompletion);
    },

    async writeCredential(entry) {
      await ready(db);
      await db
        .prepare(
          `insert into credentials
             (code, account, provider, handle, exam, title, result,
              issued_at, expires_at, superseded_by, status_index, token)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?)`,
        )
        .bind(
          entry.code,
          entry.account,
          entry.provider,
          entry.handle,
          entry.exam,
          entry.title,
          entry.result,
          entry.issuedAt,
          entry.expiresAt,
          entry.statusIndex,
          entry.token,
        )
        .run();
    },

    async nextStatusIndex() {
      await ready(db);
      // One statement, so two credentials issued at the same moment cannot be
      // given the same position.
      const row = await db
        .prepare(
          `insert into counters (name, value) values ('status_index', 0)
             on conflict(name) do update set value = value + 1
           returning value`,
        )
        .first<{ value: number }>();
      return row?.value ?? 0;
    },

    async revokedStatusIndexes() {
      await ready(db);
      const rows = await db
        .prepare(
          `select status_index from credentials where superseded_by is not null`,
        )
        .all<{ status_index: number }>();
      return rows.results.map((row) => row.status_index);
    },

    // The only write a credential row ever takes after it is inserted.
    async supersede(code, by) {
      await ready(db);
      await db
        .prepare(
          `update credentials set superseded_by = ? where code = ? and superseded_by is null`,
        )
        .bind(by, code)
        .run();
    },

    async readCredential(code) {
      await ready(db);
      const row = await db
        .prepare(`select * from credentials where code = ?`)
        .bind(code)
        .first<CredentialRow>();
      return row ? toCredential(row) : null;
    },

    async readCredentials(account) {
      await ready(db);
      const rows = await db
        .prepare(
          `select * from credentials where account = ? order by issued_at desc`,
        )
        .bind(account)
        .all<CredentialRow>();
      return rows.results.map(toCredential);
    },

    async erase(account) {
      await ready(db);
      const sessions = await db
        .prepare(`delete from sessions where account = ?`)
        .bind(account)
        .run();
      const completions = await db
        .prepare(`delete from completions where account = ?`)
        .bind(account)
        .run();
      const accounts = await db
        .prepare(`delete from accounts where key = ?`)
        .bind(account)
        .run();
      return {
        accounts: accounts.meta.changes,
        sessions: sessions.meta.changes,
        completions: completions.meta.changes,
      };
    },
  };
}

const accounts = new Map<string, Account>();
const sessions = new Map<string, { account: string; expiresAt: string }>();
const completions = new Map<string, Map<string, Completion>>();
const credentials = new Map<string, Credential>();
let statusIndexes = 0;

const memory: Store = {
  durable: false,

  async saveAccount(account) {
    const known = accounts.get(account.key);
    accounts.set(account.key, {
      ...account,
      createdAt: known?.createdAt ?? account.createdAt,
    });
  },

  async readAccount(key) {
    return accounts.get(key) ?? null;
  },

  async openSession(token, account, expiresAt) {
    sessions.set(token, { account, expiresAt });
  },

  async readSession(token) {
    return sessions.get(token) ?? null;
  },

  async closeSession(token) {
    sessions.delete(token);
  },

  async recordCompletion(account, entry) {
    const held = completions.get(account) ?? new Map<string, Completion>();
    const known = held.get(entry.lesson);
    held.set(entry.lesson, {
      ...entry,
      completedAt: known?.completedAt ?? entry.completedAt,
    });
    completions.set(account, held);
  },

  async readCompletions(account) {
    const held = completions.get(account);
    if (!held) return [];
    return [...held.values()].sort((a, b) =>
      a.completedAt.localeCompare(b.completedAt),
    );
  },
  async nextStatusIndex() {
    return statusIndexes++;
  },

  async revokedStatusIndexes() {
    return [...credentials.values()]
      .filter((entry) => entry.supersededBy !== null)
      .map((entry) => entry.statusIndex);
  },

  async writeCredential(entry) {
    credentials.set(entry.code, { ...entry });
  },

  async supersede(code, by) {
    const held = credentials.get(code);
    if (held && held.supersededBy === null)
      credentials.set(code, { ...held, supersededBy: by });
  },

  async readCredential(code) {
    return credentials.get(code) ?? null;
  },

  async readCredentials(account) {
    return [...credentials.values()]
      .filter((entry) => entry.account === account)
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  },

  async erase(account) {
    let closed = 0;
    for (const [token, session] of sessions) {
      if (session.account !== account) continue;
      sessions.delete(token);
      closed += 1;
    }
    const held = completions.get(account);
    completions.delete(account);
    return {
      accounts: accounts.delete(account) ? 1 : 0,
      sessions: closed,
      completions: held?.size ?? 0,
    };
  },
};

export function openStore(platform: App.Platform | undefined): Store {
  const db = platform?.env?.LEARN_DB;
  return db ? onD1(db) : memory;
}
