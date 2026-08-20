Composition starts with one question: does the parent require this package, or can it work without it? Required packages are dependencies. Optional capabilities are addons.

## Choose the runtime relationship

A nested dependency keeps its own sandbox and exposes only declared commands. A layer dependency contributes files directly to the parent root. An addon is installed and composed only after the user enables it for that parent.

Addon layers follow the parent manifest order. Later layers win when two packages provide the same path. The addon cannot expand the parent's host permissions, and its own manifest permissions matter only when it runs alone.

## A provider says what capability it supplies

```
"addon_provider": {
  "id": "go",
  "slot": "sdk.go",
  "mode": "exclusive",
  "exports": {
    "path": ["/opt/go/bin"],
    "include_path": ["/opt/go/include"]
  }
}
```

The slot names the capability, not the package repository. The provider ID names one implementation inside that slot. Exports add tool, library, include, pkg-config and CMake paths without assuming every SDK installs under `/usr`.

## Exclusive and multiple slots solve different cases

An `exclusive` slot activates one provider. A developer can install Go and TinyGo, then select which one supplies `sdk.go` to an editor. A `multiple` slot activates every enabled provider, which fits Steam compatibility tools such as GE-Proton and ProtoSoda.

```
cpak addon slots github.com/containerpak/vscode
cpak addon providers github.com/containerpak/vscode sdk.go
cpak addon use github.com/containerpak/vscode sdk.go go
```

Selection is stored for the parent application. Installing a new provider does not silently replace an explicit selection. Removing an active provider clears or rejects the selection according to the slot contract.

## Discovery stays local

cpak evaluates providers from installed addons supported by the parent. The Store does not assign a global winner. This keeps decentralized package origins while giving applications stable capability names.

[Dependencies and addons](/docs/dependencies-addons) covers package composition and testing both enabled and disabled states.
