// The machine this board's answers are about.
//
// A filesystem permission does not name a path on its own. home and the XDG
// user directories name a place on a machine, and what they name is read off
// that machine's home directory and its session configuration. A page cannot
// use the reader's machine for that, so the host is written down here, sent
// with every question, and shown on the page.
//
// It carries only what a filesystem answer depends on: the user, the home
// directory, and the file the session keeps its user directories in.

export const USER_DIRS_PATH = "/home/ada/.config/user-dirs.dirs";

export const USER_DIRS = [
  "# This file is written by xdg-user-dirs-update",
  'XDG_DESKTOP_DIR="$HOME/Scrivania"',
  'XDG_DOCUMENTS_DIR="$HOME/Documenti"',
  'XDG_DOWNLOAD_DIR="$HOME/Scaricati"',
  'XDG_MUSIC_DIR="$HOME/Musica"',
  'XDG_PUBLICSHARE_DIR="$HOME"',
  "",
].join("\n");

export const HOST = {
  uid: 1000,
  home: "/home/ada",
  files: { [USER_DIRS_PATH]: USER_DIRS },
};

export const HOST_FACTS = [
  "uid 1000",
  "home /home/ada",
  "a session in Italian",
];

export const HOST_SUMMARY =
  "One desktop user, uid 1000, home /home/ada, on a session in Italian.";

export const NOTES = [
  "The session renamed its user directories, so xdg-documents is not Documents here. cpak reads the same file the desktop wrote.",
  "A directory this session does not configure falls back to the name every desktop starts from, which is why xdg-pictures is still Pictures.",
  "Public share is pointed at the home directory itself, which is how a desktop turns a user directory off. cpak will not grant the home directory under another name, so that entry finds nothing here and the application starts without it.",
];

export type Entry = { path: string; access: string };

export const STARTING_POINTS: { name: string; entries: Entry[] }[] = [
  {
    name: "What a text editor asks for",
    entries: [
      { path: "home/.config/notes", access: "read-write" },
      { path: "xdg-documents", access: "read-write" },
    ],
  },
  {
    name: "What a media player asks for",
    entries: [
      { path: "xdg-music", access: "read-only" },
      { path: "xdg-videos", access: "read-only" },
      { path: "/media/library", access: "read-only" },
    ],
  },
  {
    name: "Every user directory",
    entries: [
      { path: "xdg-desktop", access: "read-only" },
      { path: "xdg-documents", access: "read-only" },
      { path: "xdg-download", access: "read-only" },
      { path: "xdg-music", access: "read-only" },
      { path: "xdg-pictures", access: "read-only" },
      { path: "xdg-public-share", access: "read-only" },
      { path: "xdg-templates", access: "read-only" },
      { path: "xdg-videos", access: "read-only" },
    ],
  },
  {
    name: "The whole machine",
    entries: [{ path: "host", access: "read-only" }],
  },
  {
    name: "A list cpak refuses",
    entries: [
      { path: "home", access: "read-write" },
      { path: "home", access: "read-only" },
      { path: "host", access: "read-write" },
      { path: "home/../etc", access: "read-only" },
    ],
  },
];

export const SCOPES = [
  { path: "home", access: "read-write", note: "The whole home directory." },
  {
    path: "home/.local/share/example",
    access: "read-write",
    note: "A path under home.",
  },
  {
    path: "host",
    access: "read-only",
    note: "The whole filesystem, read-only.",
  },
  {
    path: "xdg-desktop",
    access: "read-only",
    note: "Renamed by this session.",
  },
  {
    path: "xdg-documents",
    access: "read-write",
    note: "Renamed by this session.",
  },
  {
    path: "xdg-download",
    access: "read-write",
    note: "Renamed by this session.",
  },
  { path: "xdg-music", access: "read-only", note: "Renamed by this session." },
  {
    path: "xdg-pictures",
    access: "read-only",
    note: "One this session leaves alone.",
  },
  {
    path: "xdg-public-share",
    access: "read-only",
    note: "One this session turned off.",
  },
  {
    path: "xdg-templates",
    access: "read-only",
    note: "One this session leaves alone.",
  },
  {
    path: "xdg-videos",
    access: "read-only",
    note: "One this session leaves alone.",
  },
  { path: "/media/library", access: "read-only", note: "An absolute path." },
];
