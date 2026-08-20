A photo editor needs somewhere to open photos from. There are four ways to write that, and they are not close to equivalent. Press each of the presets in the playground and watch the right-hand column.

## Four scopes, worst first

**The whole machine.** `host`, read-only, is every file on the system that the user running it can read. Press _The whole machine_ and read how much lands. There are real reasons to ask for it, and a photo editor is not one of them.

**The whole home.** `home` is every document, every downloaded file, every dot-directory including the one your browser keeps its session in. It is the most commonly over-asked grant in any packaging system, because it is the one that always works.

**A user directory.** `xdg-pictures`, `xdg-documents`, `xdg-download` and the rest resolve against whatever that person's desktop has them set to, so `xdg-pictures` is the right answer even on a machine where it is called _Immagini_. Press _Every user directory_ and look at the resolved column: the name on the left and the path on the right are not the same string, and that is the point.

**One path.** `home/.config/fotoritocco` is one directory and nothing else. Most applications need one of these for their own settings and one user directory for the files a person opens, and nothing more.

## Read-only is a real answer

Every entry carries an access mode, and `read-only` is not a consolation prize. A viewer that never saves should ask for it. A converter that reads from one place and writes to another should ask for read-only on the first and read-write on the second, in two entries, rather than read-write on a directory that contains both.

Change an access mode in the playground and nothing else. The paths do not move; what changes is what the application may do when it gets there.

## What cpak refuses

Try _A list cpak refuses_. Some of these look reasonable and are not: a relative path has nothing to resolve against, `/` is the whole machine written in a way that hides it, and the same path twice is two different answers to one question. cpak refuses the manifest rather than picking one.

## The question to ask per line

For every entry, name the file the program will open first. If you cannot name one, the entry is a guess and it belongs out of the manifest until somebody reports the bug that needs it. A package that asks for less and gains an entry later is a package people trust; the other order does not work.

[Permissions](/docs/permissions) lists every scope and what it resolves to.
