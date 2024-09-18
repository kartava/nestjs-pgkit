import { Inject } from "@nestjs/common";

import { getClientToken } from "./pgkit.utils";
import { PGKitModuleOptions } from "../interfaces";

export const InjectClient = (
  options?: PGKitModuleOptions | string,
): ParameterDecorator => Inject(getClientToken(options));
