-- The Learn account: who is signed in, what they have read, and what they hold.
--
-- The application creates these tables on first use as well, so a dev server
-- with no D1 binding still works. This file exists so that a real deployment
-- is set up by one command rather than by the first request that happens to
-- arrive, and so that a change to the shape of a table has somewhere to live.

create table if not exists accounts (
  key        text primary key,
  provider   text not null,
  handle     text not null,
  avatar     text not null default '',
  created_at text not null,
  seen_at    text not null
);

create table if not exists sessions (
  token      text primary key,
  account    text not null,
  expires_at text not null
);

create index if not exists sessions_account on sessions (account);

create table if not exists completions (
  account      text not null,
  lesson       text not null,
  title        text not null,
  course       text not null,
  course_title text not null,
  course_total integer not null,
  completed_at text not null,
  primary key (account, lesson)
);

create table if not exists credentials (
  code          text primary key,
  account       text not null,
  provider      text not null,
  handle        text not null,
  exam          text not null,
  title         text not null,
  result        text not null,
  issued_at     text not null,
  expires_at    text not null,
  superseded_by text,
  -- Where this credential sits in the published status list. Unique, and a
  -- position is never handed out twice: reusing one would quietly un-revoke a
  -- credential somebody else is still holding.
  status_index  integer not null default 0,
  -- The signed form, empty when no signing key was configured when it was
  -- issued.
  token         text not null default ''
);

create index if not exists credentials_account on credentials (account);
create unique index if not exists credentials_status on credentials (status_index);

-- One row per counter. The status list position is allocated from here in a
-- single statement so that two credentials issued at the same moment cannot be
-- given the same one.
create table if not exists counters (
  name  text primary key,
  value integer not null
);
