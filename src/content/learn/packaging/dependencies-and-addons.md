A second package can join an application in three ways. The right choice depends on whether it is required and whether its files must share the parent root.

## Nested dependency

Use the default nested mode for a required tool that should keep its own sandbox. The parent invokes only exported commands and the nested package gets the intersection of both permission boundaries. Bottles uses this relationship for UMU.

## Layer dependency

Use `mode: layer` when required files must appear directly inside the parent filesystem. Those layers are composed below the application. This is a filesystem relationship, so the dependency does not become a separate service.

## Optional addon

Use an addon when the parent works without it and the user should choose. The addon is installed on first use and its layers join the parent only while it is enabled for that application.

```
cpak addon enable github.com/example/editor github.com/example/sdk-go
cpak addon disable github.com/example/editor github.com/example/sdk-go
```

Put contributed files where the parent expects them, or declare an addon provider with explicit path, library, include, pkg-config and CMake exports. Test enabled and disabled states. The parent must still launch after the addon is removed.

[Dependencies and addons](/docs/dependencies-addons) includes Steam and SDK examples.
