import { Module } from "@nestjs/common";
import { PGKitModule } from "../../lib";

import { postgresInvalidConnectionUri } from "./albums/configs/database.config";

@Module({
  imports: [
    PGKitModule.forRoot({
      connectionUri: postgresInvalidConnectionUri,
      retryAttempts: 1,
      retryDelay: 1000,
    }),
  ],
})
export class AppAuthenticateModule {}
