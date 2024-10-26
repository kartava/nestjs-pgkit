import { Module } from "@nestjs/common";
import { PgKitModule } from "../../lib";

import { AlbumsModule } from "./albums/albums.module";
import { ALBUMS_NAMED_CLIENT } from "./albums/albums.di-tokens";
import { postgresConnectionUri } from "./albums/configs/database.config";

@Module({
  imports: [
    PgKitModule.forRootAsync({
      useFactory: () => ({
        connectionUri: postgresConnectionUri,
        retryAttempts: 2,
        retryDelay: 1000,
      }),
    }),
    PgKitModule.forRoot({
      name: ALBUMS_NAMED_CLIENT,
      connectionUri: postgresConnectionUri,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    AlbumsModule,
  ],
})
export class AsyncOptionsFactoryModule {}
