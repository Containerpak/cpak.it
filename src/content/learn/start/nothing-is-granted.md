The starting manifest is a desktop application example. Its five permissions open a Wayland window, play sound, send notifications, pass links to the host and reach the network. They are there so you can remove them and watch each part of the answer disappear.

Open `cpak.json` in the playground and replace the whole `override` object with an empty one. Every path disappears. That is where a package starts: no directory, no socket, no device, no route off the machine.

Add `"socketWayland": true`. Two paths appear: the compositor socket and the lock beside it. The socket is the window, and without it the application draws nowhere. Run `cpak validate` in the terminal below the file to check the manifest.

## Read a permission as the paths it opens

Add `"socketX11": true` as well. Two paths become eight. Four of the new ones are X11's own socket directories, the fifth is the authority file a client needs to connect, and the sixth is there only because both permissions are on at once: the cookie Xwayland writes.

Read the note under the socket directory. X11 does not separate its clients, so anything on that display can read the clipboard, watch what is typed into other windows and copy their pixels. Wayland hands over none of that.

Both are one line in a manifest and both are called a permission. The name tells you almost nothing. The paths tell you what the application can do.

## Eight are wider than their name

Most permissions open one socket or one directory. Eight open more than the thing they name. The reference under the workspace gives you every key accepted by this build, while the answer beside the manifest shows what each change opens.

Three of them open a bus rather than a service: `socketSessionBus`, `socketSystemBus` and `socketBluetooth`, which binds the same socket as the system bus under a friendlier name. What a package reaches through a bus is whatever the host has listening on it, which is settled on the machine rather than in the manifest.

`deviceAll` binds `/dev/` whole, and eleven device permissions below it stop meaning anything while it is on.

The last four bind no path at all, which is what makes them easy to skip over. `network` gives the container a route off the machine instead of a network namespace of its own. `process` shares the host process namespace, so the package sees processes outside the sandbox. `userNamespaces` lets the application build a nested sandbox, which a browser needs and almost nothing else does. `asRoot` runs the process as uid 0 inside the container.

Take the package you want to ship and ask which of those eight it cannot work without. That question is what a manifest review is made of.

[Permissions](/docs/permissions) is the reference behind this lesson.
