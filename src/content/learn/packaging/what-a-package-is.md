Publishing with cpak is publishing three things, and only one of them is interesting.

## The image

An OCI image: your program and everything it needs to run. If you have built a container before, this is the same artefact and the same tools build it. cpak does not care how it was made, only that it can be pulled and that its digest is what it says it is.

Nothing about the image decides what the application may touch. A program that opens `/etc/shadow` inside a cpak container fails, and it fails whether or not the image was built as root, because the container it runs in was never given that file.

## The manifest

A short JSON file beside the image. It names the application, the binaries and desktop entries to export, and the access it wants. That last list is the whole subject of this course.

```
{
  "$schema": "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v3.json",
  "manifest_version": "3.0",
  "name": "Fotoritocco",
  "description": "A photo editor",
  "version": "3.2.0",
  "image": "ghcr.io/example/fotoritocco@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "binaries": ["/usr/bin/fotoritocco"],
  "services": {
    "server": { "binary": "/usr/bin/fotoritocco", "arguments": ["serve"] }
  },
  "idle_time": 0,
  "override": {
    "socketWayland": true,
    "filesystem": [{ "path": "xdg-pictures", "access": "read-write" }]
  }
}
```

`binaries` lists commands a person or desktop entry may launch. `services` can give one of those binaries a named argument vector for `cpak run --service` and persistent service management. It does not make the command persistent by itself; the person operating the machine decides that with `cpak service enable`.

Read that override as a promise rather than a configuration. It is printed to the person installing your package, line by line, before anything is downloaded. Every line you add is a line somebody reads and weighs, and a line they can refuse.

## The address

A package is installed from a repository address, not from a name in a central index:

```
cpak install github.com/you/fotoritocco
```

There is no review queue and no gatekeeper. That cuts both ways, and it is worth being clear about which way it cuts for you: nobody will stop you publishing, and nobody will vouch for you either. What a stranger has to go on is the manifest they can read and the signature they can check.

## Why the manifest exists at all

Not to configure the sandbox. The sandbox exists whether or not you write a manifest, and an application with no override gets a container with no display, no sound, no network and no directory. The manifest is how you ask for the few things back.

Which turns the packager's job into one question, asked once per line: **what is the smallest thing that makes this work?** Not the smallest thing that makes it work on your machine with your files, the smallest thing that makes it work at all. The next two lessons are that question applied to the two places people get it wrong most often: the filesystem, and the desktop entry.

[The manifest reference](/docs/manifest) lists every field. It is worth having open while you read the rest of this.
