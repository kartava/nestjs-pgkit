import { Module } from "@nestjs/common";
import { PgKitModule } from "../../lib";

import { postgresInvalidConnectionUri } from "./albums/configs/database.config";

@Module({
  imports: [
    PgKitModule.forRoot({
      connectionUri: postgresInvalidConnectionUri,
      retryAttempts: 1,
      retryDelay: 1000,
    }),
  ],
})
export class AppAuthenticateModule {}
