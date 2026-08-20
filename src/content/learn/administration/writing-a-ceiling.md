A ceiling is written the same way a manifest override is, which is what makes it easy to misread. Everything below is what the playground beside this text will show you if you change it, and it is worth changing it.

## A key you leave out is a key you left to them

A ceiling decides only the keys it writes. Anything it does not name is not denied and not granted: it is left to whatever the package asked for and the person who installed it allowed.

So the shortest useful ceiling is short. Name the two or three things this host will not have, and leave the rest alone:

```
{
  "network": false,
  "deviceAll": false,
  "filesystem": [{ "path": "home/Documents", "access": "read-only" }]
}
```

## Writing true grants nothing

Press _A ceiling that closes nothing_. The ceiling says `"deviceAll": false` and the application still has the GPU, because it asked for `deviceDri`, which the ceiling never named.

Now try writing `"deviceDri": true` into the ceiling yourself. Nothing changes. A ceiling is met by intersection: writing true says this host will not stand in the way, which is exactly what leaving the key out already said. If you find yourself writing true in a ceiling to give something to a package, stop: the grant has to come from its manifest or a saved local override.

## One door with two names is one door

Press _One door, two names_. The ceiling closes `socketSystemBus`, and `socketBluetooth` closes with it, because they open the same socket. Closing one and leaving the other would close nothing at all, so naming either holds both.

The same is true of the filesystem: name `filesystem` and you also hold the legacy fields that reach the same directories under older names. The panel on the right lists what each key you wrote actually holds. Read it before you decide the ceiling is finished.

## Narrowing is not only removing

The case the playground opens on, _Held to one directory_, is the one worth understanding: the package asked for the whole home read-write, the ceiling allows the home read-only, and the result is not a refusal. The grant survives, holding less. A path the ceiling does not cover, on the other hand, is not downgraded: it is gone.

Which is why the count of permissions is a poor way to check your work. Read the table of what changed, not the total.

## Before you set it on a real machine

Paste your own ceiling into the playground with the manifest of something your users actually run, and read what comes out. A ceiling that closes more than you meant does not fail loudly: the application starts, and something inside it stops working a week later.

`cpak system explain ORIGIN` answers the same question on the machine itself, for a package that is really installed.
