-- Accounts, course progress and credentials for cpak Learn.

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
  status_index  integer not null default 0,
  token         text not null default ''
);

create index if not exists credentials_account on credentials (account);
create unique index if not exists credentials_status on credentials (status_index);

create table if not exists counters (
  name  text primary key,
  value integer not null
);
