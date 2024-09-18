## Description

[pgkit](https://www.pgkit.dev/) module
for [Nest](https://github.com/nestjs/nest).

## Status

🚧 **Under Development** 🚧

- Features and functionality are still being actively worked on.
- Expect breaking changes until an initial stable release.

## Contents
* [nestjs-pgkit](#nestjs-pgkit)
    * [Installation](#installation)
    * [Basic import](#basic-import)
    * [Multiple databases](#multiple-databases)
    * [License](#license)

<a name="installation"></a>
### Installation

###### npm

```bash
TBA
```

###### yarn

```bash
TBA
```

<a name="basic-import"></a>
### Basic import

Once the installation process is complete, we can import the `PGKitModule` into the root `AppModule`.


> app.module.ts
```typescript
import { Module } from "@nestjs/common";
import { PGKitModule } from "nestjs-pgkit";

@Module({
  imports: [
    PGKitModule.forRoot({
      connectionUri: "postgres://user:password@localhost:5432/test",
    }),
  ],
})
export class AppModule {}
```

The `forRoot()` method supports configuration properties described below.

<table>
  <tr>
    <td colspan='2'><b>PGKit options</b></td>
  </tr>
  <tr>
    <td><code>connectionUri</code></td>
    <td><a href='https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING'>Connection URI</a></td>
  </tr>
  <tr>
    <td colspan='2'><b>PGKitModule options</b></td>
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
    PGKitModule.forRoot({
      connectionUri: "postgres://user:password@users_db_host:5432/users",
    }),
    PGKitModule.forRoot({
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

[MIT license](LICENSE)
