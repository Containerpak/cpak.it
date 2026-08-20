Your image ships a `.desktop` file. Exported as written, its `Exec` line would start your program on the host, outside the container, with everything the person running it can reach. So cpak does not export it as written: it reads the file and rewrites every command in it to go through `cpak run`.

The playground beside this text is that rewriting, line by line. It starts on _A published entry_, which is the ordinary case.

## Every spelling, not the obvious one

Press _The same key, three ways_. Three lines in that file set `Exec`, spelled with a leading space, a tab, and a gap before the equals sign. A launcher does not compare bytes: it strips that whitespace, reads all three as the same key, and runs the last one it finds.

Which means rewriting the first one and leaving the others is worse than doing nothing, because the file would look handled and the program would still start outside the container. All three are rewritten. If you take one thing from this lesson: the launcher's rules, not the file's appearance, decide what runs.

## And nothing that only looks like it

Press _Lines that only look like Exec_. Four lines contain the word and one sets the key. A comment is not a key. `Exec[de]` is a different key. `ExecPath` is a different key. A value that happens to spell the word is a value. Nothing is rewritten that a launcher would not have run, because a rewritten line that was never a command is a file you have quietly corrupted.

## What it will not do for you

Press _A file with no [Desktop Entry] group_. The commands are still rewritten, because a command a launcher can reach has to run inside the sandbox wherever it is written. What cpak does not do is invent the group that should have been there.

That is the shape of the whole feature: it fixes what it can read and refuses to guess at what you did not write. A file with no group is a file to fix in your image, and the export will tell you so rather than making something up.

## Two files, not one

The entry cpak writes is not the entry you shipped, and both stay readable: yours in the image, and the exported one under the user's applications directory. Paste your own file into the playground before you publish. If a line you expected to be rewritten is marked left alone, that is the bug, and it is much cheaper to find here than after somebody installs it.

[System integration](/docs/system-integration) is the reference behind this lesson.
