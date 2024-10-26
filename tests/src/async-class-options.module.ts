import { Module } from "@nestjs/common";
import {
  PgKitModule,
  PgKitModuleOptions,
  PgKitOptionsFactory,
} from "../../lib";

import { AlbumsModule } from "./albums/albums.module";
import { ALBUMS_NAMED_CLIENT } from "./albums/albums.di-tokens";
import { postgresConnectionUri } from "./albums/configs/database.config";

class ConfigService implements PgKitOptionsFactory {
  createPgKitOptions(): PgKitModuleOptions {
    return {
      connectionUri: postgresConnectionUri,
      retryAttempts: 2,
      retryDelay: 1000,
    };
  }
}

@Module({
  imports: [
    PgKitModule.forRootAsync({
      useClass: ConfigService,
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
export class AsyncOptionsClassModule {}