The starting manifest is a desktop application example. Its five permissions open a Wayland window, play sound, send notifications, pass links to the host and reach the network. They are there so you can remove them and watch each part of the answer disappear.

Open `cpak.json` in the playground and replace the whole `override` object with an empty one. Every path disappears. That is where a package starts: no directory, no socket, no device, no route off the machine.

Add `"socketWayland": true`. Two paths appear: the compositor socket and the lock beside it. The socket is the window, and without it the application draws nowhere. Run `cpak validate` in the terminal below the file to check the manifest.

## Read a permission as the boundary it opens

Add `"displayX11": true` as well. No host X11 socket appears. cpak starts a private X11 compatibility display and points the package at that endpoint instead of the host display.

That difference is deliberate. Manifest v3 removed raw X11 access because clients on one host display can observe each other's clipboard, input and pixels. The replacement still runs X11 applications without giving them the host display.

Both permissions occupy one line, but only one binds a host path. Read the requested capability, the paths and the brokered services together.

## Some permissions are wider than their name

Most permissions expose one resource. A few change a whole namespace or grant a typed host service. The reference under the workspace gives you every manifest v3 key accepted by this build, while the answer beside the manifest shows what each change opens.

`sessionBus` names exact destinations, object paths, interfaces and methods. `bluetooth` exposes BlueZ through a private filtered bus. Neither permission hands the package a raw host bus socket. `notification`, `openURI`, `filePicker`, `hostApplications` and `hostActions` also cross the boundary through typed requests rather than broad socket mounts.

`deviceAll` binds `/dev/` whole, and eleven device permissions below it stop meaning anything while it is on.

Five other permissions bind no path at all, which makes them easy to skip over. `network` adds internet and LAN access to a private namespace while host loopback stays blocked. `hostNetwork` shares the host network namespace, including localhost, and requires `network`. `process` shares the host process namespace, so the package sees processes outside the sandbox. `userNamespaces` lets the application build a nested sandbox, which browsers need. `asRoot` runs the process as uid 0 inside the container.

Take the package you want to ship and ask which capabilities it cannot work without, then grant the narrowest form available. That question is what a manifest review is made of.

[Permissions](/docs/permissions) is the reference behind this lesson.
