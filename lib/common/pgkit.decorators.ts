import { Inject } from "@nestjs/common";

import { getClientToken } from "./pgkit.utils";
import { PgKitModuleOptions } from "../interfaces";

export const InjectClient = (
  options?: PgKitModuleOptions | string,
): ParameterDecorator => Inject(getClientToken(options));
