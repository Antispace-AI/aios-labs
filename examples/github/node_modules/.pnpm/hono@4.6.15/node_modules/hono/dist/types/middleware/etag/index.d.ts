/**
 * @module
 * ETag Middleware for Hono.
 */
import type { MiddlewareHandler } from '../../types';
type ETagOptions = {
    retainedHeaders?: string[];
    weak?: boolean;
};
/**
 * Default headers to pass through on 304 responses. From the spec:
 * > The response must not contain a body and must include the headers that
 * > would have been sent in an equivalent 200 OK response: Cache-Control,
 * > Content-Location, Date, ETag, Expires, and Vary.
 */
export declare const RETAINED_304_HEADERS: string[];
/**
 * ETag Middleware for Hono.
 *
 * @see {@link https://hono.dev/docs/middleware/builtin/etag}
 *
 * @param {ETagOptions} [options] - The options for the ETag middleware.
 * @param {boolean} [options.weak=false] - Define using or not using a weak validation. If true is set, then `W/` is added to the prefix of the value.
 * @param {string[]} [options.retainedHeaders=RETAINED_304_HEADERS] - The headers that you want to retain in the 304 Response.
 * @returns {MiddlewareHandler} The middleware handler function.
 *
 * @example
 * ```ts
 * const app = new Hono()
 *
 * app.use('/etag/*', etag())
 * app.get('/etag/abc', (c) => {
 *   return c.text('Hono is cool')
 * })
 * ```
 */
export declare const etag: (options?: ETagOptions) => MiddlewareHandler;
export {};
