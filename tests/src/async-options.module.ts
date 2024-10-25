import { Module } from "@nestjs/common";
import { PGKitModule } from "../../lib";

import { AlbumsModule } from "./albums/albums.module";
import { postgresConnectionUri } from "./albums/configs/database.config";

@Module({
  imports: [
    PGKitModule.forRootAsync({
      useFactory: () => ({
        connectionUri: postgresConnectionUri,
        retryAttempts: 2,
        retryDelay: 1000,
      }),
    }),
    PGKitModule.forRoot({
      name: "connection_2",
      connectionUri: postgresConnectionUri,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    AlbumsModule,
  ],
})
export class AsyncOptionsFactoryModule {}
