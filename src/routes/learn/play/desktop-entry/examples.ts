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
    note: "A launcher does not compare bytes. It skips the whitespace before the key and around the equals sign, so all three of these lines set Exec, and the last one is the one it runs.",
    fileName: "org.example.Writer.desktop",
    entry: [
      "[Desktop Entry]",
      "Type=Application",
      "Name=Writer",
      "Comment=Write and edit documents",
      " Exec=writer %F",
      "\tExec=writer --safe %U",
      "Exec =writer",
      "#Exec=writer --debug",
      "TryExec=writer",
      "Icon=writer",
      "Categories=Office;WordProcessor;",
      "MimeType=text/plain;",
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
