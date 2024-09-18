import { Logger } from "@nestjs/common";

import { Observable } from "rxjs";
import { delay, retryWhen, scan } from "rxjs/operators";

import { PGKitModuleOptions } from "../interfaces";
import { DEFAULT_CLIENT_NAME, LOGGER_CONTEXT } from "../pgkit.constants";

const logger = new Logger(LOGGER_CONTEXT);

export function getClientName(options: PGKitModuleOptions): string {
  return options && options.name ? options.name : DEFAULT_CLIENT_NAME;
}

/**
 * This function returns a Client injection token for the given PGKitModuleOptions or client name.
 * @param options {PGKitModuleOptions | string} [options='default'] This optional parameter is either
 * a PGKitModuleOptions or a string.
 * @returns {string} The Client injection token.
 */
export function getClientToken(
  options: PGKitModuleOptions | string = DEFAULT_CLIENT_NAME,
): string {
  const name = typeof options === "string" ? options : getClientName(options);

  return `${name}_PG_KIT_CLIENT`;
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
  clientName = DEFAULT_CLIENT_NAME,
  verboseRetryLog = false,
  toRetry?: (err: any) => boolean,
): <T>(source: Observable<T>) => Observable<T> {
  const logRetryAttempt = (currentAttempt: number, error: Error) => {
    const dbInfo = clientName === DEFAULT_CLIENT_NAME ? "" : `(${clientName})`;
    const baseMessage = `Unable to connect to the database ${dbInfo}.`;
    const verboseMessage = verboseRetryLog ? ` Message: ${error.message}.` : "";
    const retryInfo = ` Retrying (${currentAttempt} of ${retryAttempts})...`;

    logger.error(`${baseMessage}${verboseMessage}${retryInfo}`, error.stack);
  };

  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error: Error) => {
            const currentAttempt = errorCount + 1;
            if (toRetry && !toRetry(error)) {
              throw error;
            }
            logRetryAttempt(currentAttempt, error);
            if (currentAttempt >= retryAttempts) {
              throw error;
            }
            return currentAttempt;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}
