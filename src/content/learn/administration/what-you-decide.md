Start with what you do not decide. cpak installs into a person's own home directory, as that person, with no root and no system-wide package list. You cannot approve an installation, you cannot see one from another account, and removing a package from the machine is not something you do.

That is deliberate, and it is why there is anything on this page at all: if the runtime handed every user a sandbox and gave the machine owner no say in how wide it could be, a managed fleet could not use it. So it gives you three decisions, and every one of them is about the machine rather than about any one installation.

## One: how wide anything may be

A **ceiling** is a policy file that sits above every installation on the host. Whatever a package asks for, and whatever the person who installed it allows, is held to what the ceiling permits.

```
cpak system set-ceiling /etc/cpak/ceiling.json
cpak system ceiling            # what is in force now
cpak system set-ceiling none   # remove it
```

Setting it asks for an administrator password, and the file is read and understood before anybody is asked for one, so a mistyped path costs you a message rather than an authentication. It applies to every account on the machine, including yours.

The next lesson is how to write one, and it is worth being clear now about the thing that catches people: **a ceiling never grants**. It is met by intersection. It can only take away.

## Two: whether a launch has to match

When an application is installed, cpak records what it was: which layers, under which policy, signed by whom. **Enforcement** is your decision about what happens when a launch does not match that record.

```
cpak system set-enforcement warn
cpak system enforcement        # what is in force now
```

Three levels, and they are a sequence rather than a menu:

**off** is the default, and it is why cpak can ship this at all: a machine that has never been set up behaves as it always did.

**warn** says at every launch what `refuse` would have refused, and lets it run. This is where you live for a while. It costs nothing and it tells you exactly which packages on your fleet would stop.

**refuse** is the point of the exercise: an application the ledger does not recognise does not start.

Going from off to refuse without spending time in warn is how you find out at nine on a Monday which application nobody had re-enrolled.

## Three: whose software this host takes

Whether an unsigned package is enrolled at all, and which publishers you accept a signature from. That one has a lesson of its own further on, because it is the decision with a file behind it rather than a value.

## What none of them can do

A ceiling cannot enable a permission unless the manifest or a saved local override requests it, and enforcement cannot make an unsigned package signed. Both narrow. If what you need is for people to only install software somebody vouched for, that is a third decision, and it is the next lesson but one.
