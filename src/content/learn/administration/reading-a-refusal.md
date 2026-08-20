Everything so far was setting policy. This lesson is the other half of the job: somebody says an application will not start, and you have five minutes to say why.

## What is in force here

```
cpak system status
```

The first command to run and the one people skip. It answers what the enforcement level is, what the signature policy is, whether a ceiling and a trust policy are set. A surprising number of "cpak is broken" reports are a host somebody set to `refuse` and forgot.

## Why this one package

```
cpak system explain github.com/example/thing
```

The same question asked about one installation that really exists on this machine, rather than about the policy in the abstract. It is the answer to "the ceiling looks fine, so why is this being narrowed", and it is the thing to paste into a ticket.

The ceiling playground answers the same question before you set anything. This one answers it afterwards, on the machine, about a real package.

## The refusal that outlives the application

Removing an application does not remove what the ledger knows about it. The generation it had reached and whether a publisher had ever answered for it are kept, so that removing something cannot become the way to put an older or unsigned version in its place.

Which is right, and which produces the one refusal that confuses people: a reinstall that will not enrol, on a machine where the application is not even installed. The message says so and names the way out.

```
cpak system clear-removal github.com/example/thing
```

This gives that memory up. It asks for an administrator password, and there is deliberately no cheaper version of it for your own account: forgetting an anchor leaves an application with less, while this hands back a floor that was standing against a downgrade, an unsigning and a widening at once.

Before anybody authenticates, it prints what is about to be given up. Read that. If the generation it names is higher than the one you are about to install, the refusal was doing its job and clearing it is how you install the older thing anyway.

## The order to work in

Status first, because it is one command and it explains most reports. Explain second, because it turns a policy question into a fact about one package. Clear-removal last, and only when you have read what it says you are giving up: it is the only one of the three that decides something rather than reporting it.
