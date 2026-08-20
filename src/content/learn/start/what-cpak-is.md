cpak installs applications on Linux. What makes it different from the package manager your distribution ships is what an installed application is allowed to do afterwards.

Install a program the ordinary way and it runs as you. It can read every file you can read: your documents, your photos, your browser profile, the keys in `~/.ssh`. Nothing asked you about any of that, and nothing is watching. A text editor and a password manager have exactly the same reach.

Install the same program with cpak and it starts with none of it. No directory, no microphone, no network, no window. Everything it can touch is something it asked for by name, in a file that ships with it and that you can read before you install.

## What actually gets installed

An application you install with cpak is not a set of files spread across your system. It is an image: the program and everything it needs to run, downloaded as one thing and kept together.

Beside the image comes a short file, the manifest. It is the list of what the application wants: which folders, which devices, whether it may reach the network. Nothing else is granted, and there is no default that quietly hands over more.

When you run it, cpak builds a small world around the program. Inside that world the program sees its own image and whatever the manifest asked for. Everything else on your machine simply is not there. Not hidden, not read-only: absent.

## Why this is worth the trouble

Because the interesting question about software you did not write is not whether it is malicious. It is what it could do if it were, or if it were compromised next year, or if the person maintaining it changed.

A manifest turns that from a matter of trust into a matter of reading. You can look at what an application asked for, before you install it, and decide whether the answer is reasonable for what the thing claims to be. A calculator that asks for your home directory is a calculator you now know something about.

## Three words you will keep meeting

**Package**. The application as cpak installs it: the image, the manifest, and the name it is published under.

**Manifest**. The file that lists what the package asks for. You will read a lot of these.

**Permission**. One line in that list. A folder, a device, a socket, the network. The next lesson is about what one of them really opens, which is usually more than its name suggests.
