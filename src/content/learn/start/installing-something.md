Installing looks like this:

```
cpak install github.com/containerpak/vlc
```

That address is the package. It is a repository, not a name in a central index, so the people who publish the application are the people who own the address. There is no queue and no gatekeeper between them and you.

## What you are shown

Before anything is downloaded, cpak fetches the manifest and prints what it asks for. This is the whole of it, for the command above:

```
The following cpak(s) will be installed:
  - VLC: Play video, audio and network streams.

The following will be exported:
  - (binary) /usr/bin/vlc
  - (desktop entry) /usr/share/applications/vlc.desktop

The following permissions will be granted:
  - Display: isolated X11 compatibility display, Wayland
  - Audio: PulseAudio
  - Devices: graphics, shared memory
  - Files: xdg-videos, read only
  - Network: internet and local network

Do you want to continue? [y/N]
```

The prompt lists only the access the package asks for. A capability that is not listed is not granted. Typed permissions include their scope, such as the exact filesystem path, access mode or session service call.

This is the moment the decision happens. Afterwards the application has what the list said and nothing else, and you will not be asked again.

Read the list against what the thing claims to be. A video player asking for the display, audio and your Videos folder is a video player. The same player asking to run as root, or for the whole of your home, is telling you something the description did not.

## Yes is not the only answer

You can change a package after installing it. Remove a permission you do not accept, restore one the application needs or add access the manifest did not request:

```
cpak override github.com/containerpak/vlc --key network --value false
```

Your decision replaces the publisher's request on this installation. On a managed machine it still cannot exceed the system ceiling set by the administrator. If the application stops working after you remove a permission, you can put it back.

## Where it goes

Everything lands under your own home directory. There is no system-wide install, no root, nothing dropped into `/usr`. Removing a package removes its runtime files and desktop integration. Its private home remains available for a later reinstall unless you remove it with `cpak remove --purge`.

That is the whole workflow: read a list, agree or narrow it, and remove it cleanly when you are done. The rest of this course is about reading the list well, because a permission's name is a poor guide to what it opens.
