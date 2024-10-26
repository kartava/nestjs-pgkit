<a name="nestjs-pgkit"></a>
## Description

[pgkit](https://www.pgkit.dev/packages/client/) module
for [Nest](https://github.com/nestjs/nest).

## Contents
* [nestjs-pgkit](#nestjs-pgkit)
    * [Installation](#installation)
    * [Basic import](#basic-import)
    * [Multiple databases](#multiple-databases)
    * [Async configuration](#async-configuration)
    * [License](#license)

<a name="installation"></a>
### Installation

###### npm

```bash
npm i --save nestjs-pgkit @pgkit/client
```

###### yarn

```bash
yarn add nestjs-pgkit @pgkit/client
```

<a name="basic-import"></a>
### Basic import

Once the installation process is complete, we can import the `PgKitModule` into the root `AppModule`.


> app.module.ts
```typescript
import { Module } from "@nestjs/common";
import { PgKitModule } from "nestjs-pgkit";

@Module({
  imports: [
    PgKitModule.forRoot({
      connectionUri: "postgres://user:password@localhost:5432/test",
    }),
  ],
})
export class AppModule {}
```

The `forRoot()` method supports configuration properties described below.

<table>
  <tr>
    <td colspan='2'><b>PgKit options</b></td>
  </tr>
  <tr>
    <td><code>connectionUri</code></td>
    <td><a href='https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING'>Connection URI</a></td>
  </tr>
  <tr>
    <td colspan='2'><b>PgKitModule options</b></td>
  </tr>
  <tr>
    <td><code>name</code></td>
    <td>Connection client name. Used to inject different db connections (default: <code>default</code>)</td>
  </tr>
  <tr>
    <td><code>toRetry</code></td>
    <td>Function that determines whether the module should attempt to connect upon failure
<br><code>(err: any) => boolean</code>
<br>err parameter is error that was thrown</td>
  </tr>
  <tr>
    <td><code>verboseRetryLog</code></td>
    <td>If <code>true</code>, will show verbose error messages on each connection retry (default: <code>false</code>)</td>
  </tr>
  <tr>
    <td><code>retryAttempts</code></td>
    <td>Number of attempts to connect to the database (default: <code>10</code>)</td>
  </tr>
  <tr>
    <td><code>retryDelay</code></td>
    <td>Delay between connection retry attempts (ms) (default: <code>3000</code>)</td>
  </tr>
</table>

Once this is done, the pgkit client will be available to inject across the entire project (without needing to
import any modules), for example:

> app.service.ts
```typescript
import { Injectable } from "@nestjs/common";

import { Client, sql } from "@pgkit/client";
import { InjectClient } from "nestjs-pgkit";

@Injectable()
export class AppService {
  constructor(
    @InjectClient()
    private readonly client: Client,
  ) {}

  getGreeting(): Promise<string> {
    return this.client.oneFirst<string>(sql`SELECT 'Hello World!';`);
  }
}
```

<a name="multiple-databases"></a>
### Multiple databases

Some projects require multiple database connections. This can also be achieved with this module.
To work with multiple clients, first create the clients. In this case, client naming becomes **mandatory**.

```typescript
@Module({
  imports: [
    PgKitModule.forRoot({
      connectionUri: "postgres://user:password@users_db_host:5432/users",
    }),
    PgKitModule.forRoot({
      name: "ALBUMS_CLIENT",
      connectionUri: "postgres://user:password@albums_db_host:5432/albums",
    }),
  ],
})
export class AppModule {}
```

> **Notice** If you don't set the `name` for a client, its name is set to `default`. Please note that you shouldn't
> have multiple clients without a name, or with the same name, otherwise they will get overridden.

Now you can inject the pgkit client for a given client name:

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectClient()
    private usersClient: Client,
    @InjectClient("ALBUMS_CLIENT")
    private albumsClient: Client,
  ) {}
}
```

<a name="async-configuration"></a>
### Async configuration

You may want to pass your `PgKitModule` options asynchronously instead of statically.
In this case, use the `forRootAsync()` method, which provides several ways to deal with async configuration.

One approach is to use a factory function:

```typescript
PgKitModule.forRootAsync({
  useFactory: () => ({
    connectionUri: "postgres://user:password@users_db_host:5432/users",
  }),
});
```

Our factory behaves like any other [asynchronous provider](https://docs.nestjs.com/fundamentals/async-providers)
(e.g., it can be `async` and it's able to inject dependencies through `inject`).

```typescript
PgKitModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    connectionUri: configService.get("DATABASE_URL"),
  }),
  inject: [ConfigService],
});
```

Alternatively, you can use the `useClass` syntax:

```typescript
PgKitModule.forRootAsync({
  useClass: PgKitConfigService,
});
```

The construction above will instantiate `PgKitConfigService` inside `PgKitModule` and use it to provide
an options object by calling `createPgKitOptions()`. Note that this means that the `PgKitConfigService`
has to implement the `PgKitOptionsFactory` interface, as shown below:

```typescript
@Injectable()
class PgKitConfigService implements PgKitOptionsFactory {
  createPgKitOptions(): PgKitModuleOptions {
    return {
      connectionUri: "postgres://user:password@users_db_host:5432/users",
    };
  }
}
```

In order to prevent the creation of `PgKitConfigService` inside `PgKitModule` and use a provider imported
from a different module, you can use the `useExisting` syntax.

```typescript
PgKitModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

This construction works the same as `useClass` with one critical difference - `PgKitModule` will lookup
imported modules to reuse an existing `ConfigService` instead of instantiating a new one.

> Make sure that the `name` property is defined at the same level as the `useFactory`, `useClass`, or
> `useValue` property. This will allow Nest to properly register the pool under the appropriate injection token.
```typescript
PgKitModule.forRootAsync({
  name: "ALBUMS_CLIENT",
  useFactory: () => ({
    connectionUri: postgresConnectionUri,
  }),
})
```

<a name="license"></a>
[MIT license](LICENSE)
