import { HttpContextToken } from '@angular/common/http';

/** Set by the BackendCommunicator on the login request, which goes out without a token. */
export const SKIPS_AUTH = new HttpContextToken<boolean>(() => false);
