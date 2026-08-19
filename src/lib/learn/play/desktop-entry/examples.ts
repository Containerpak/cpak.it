// The entries the board starts from.
//
// Each one is a file a package could plausibly ship, chosen because cpak does
// something to it that is easy to get wrong by reading the file yourself. The
// board never says what will happen to them: it asks the module and shows the
// answer.

export type Example = {
  id: string;
  name: string;
  note: string;
  fileName: string;
  entry: string;
};

export const EXAMPLES: Example[] = [
  {
    id: "spellings",
    name: "The same key, three ways",
    note: "A launcher does not compare bytes. It skips the whitespace before the key and around the equals sign, so a space, a tab and a gap before the equals sign all set Exec. All three are rewritten, and the one the launcher keeps is the last it reads in the group.",
    fileName: "org.example.Writer.desktop",
    entry: [
      "[Desktop Entry]",
      "Type=Application",
      "Name=Writer",
      "Comment=Write and edit documents",
      " Exec=writer %F",
      "\tExec=writer --safe %U",
      "Exec =writer",
      "TryExec=writer",
      "Icon=writer",
      "Categories=Office;WordProcessor;",
      "MimeType=text/plain;",
    ].join("\n"),
  },
  {
    id: "near-misses",
    name: "Lines that only look like Exec",
    note: "Four lines here contain the word Exec and only one of them sets the key. A comment is not a key, a locale suffix is a different key the launcher would never run, a longer name is a different key too, and a value that happens to spell Exec is only a value.",
    fileName: "org.example.Reader.desktop",
    entry: [
      "[Desktop Entry]",
      "Type=Application",
      "Name=Reader",
      "Comment=Exec=is only a word here",
      "#Exec=reader --debug",
      "Exec[it]=reader --lingua it",
      "ExecPath=/usr/bin/reader",
      "Exec=reader %f",
      "Icon=reader",
      "Terminal=false",
    ].join("\n"),
  },
  {
    id: "published",
    name: "A published entry",
    note: "The ordinary case: a program installed under a path with a space in it, a field code the launcher fills in with the files you picked, and a second command in an action group.",
    fileName: "org.example.PhotoLab.desktop",
    entry: [
      "[Desktop Entry]",
      "Type=Application",
      "Name=Photo Lab",
      "GenericName=Photo editor",
      'Exec="/opt/Photo Lab/bin/photolab" --gpu %U',
      "TryExec=/opt/Photo Lab/bin/photolab",
      "Icon=photolab",
      "Terminal=false",
      "Categories=Graphics;",
      "MimeType=image/jpeg;image/png;",
      "",
      "[Desktop Action new-window]",
      "Name=New Window",
      'Exec="/opt/Photo Lab/bin/photolab" --new-window',
    ].join("\n"),
  },
  {
    id: "no-group",
    name: "A file with no [Desktop Entry] group",
    note: "A file that opens with something else is still rewritten, because a command a launcher can reach has to run inside the sandbox wherever it is written. The alias is the part that cannot be made: cpak will not invent the group it would have to write its own keys into.",
    fileName: "org.example.Viewer.desktop",
    entry: ["[Desktop Action open]", "Name=Open", "Exec=viewer %f"].join("\n"),
  },
];

export const EXPORT_DEFAULTS = {
  origin: "example.org/writer",
  cpakId: "8f14e45fceea167a",
  launcher: "/usr/bin/cpak",
  icon: "/home/ada/.local/share/cpak/icons/example.org/writer.png",
};

// A second export of the same file, asked for with values nothing else uses.
//
// One export says what cpak wrote. Two say which lines cpak read: a line whose
// key it acts on moves when these values change, and a line it never read
// cannot. That is how this board can mark a key without parsing the file
// itself, which would be this page guessing at what a launcher does instead of
// showing what cpak does.
export const PROBE = {
  origin: "probe.invalid/probe",
  cpakId: "0000000000000000",
  launcher: "/probe/cpak",
  icon: "/probe/icon.png",
};

/** A probe value that cannot collide with the one the board is asking about. */
export function probe(value: string, mark: string): string {
  return value.trim() === mark ? `${mark}-2` : mark;
}
