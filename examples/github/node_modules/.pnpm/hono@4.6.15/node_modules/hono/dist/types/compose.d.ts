import type { Env, ErrorHandler, NotFoundHandler } from './types';
/**
 * Interface representing the context for a composition operation.
 */
interface ComposeContext {
    /**
     * Indicates whether the composition process has been finalized.
     */
    finalized: boolean;
    /**
     * The result of the composition process. The type is unknown and should be
     * specified based on the context where this interface is used.
     */
    res: unknown;
}
/**
 * Compose middleware functions into a single function based on `koa-compose` package.
 *
 * @template C - The context type.
 * @template E - The environment type.
 *
 * @param {[[Function, unknown], ParamIndexMap | Params][]} middleware - An array of middleware functions and their corresponding parameters.
 * @param {ErrorHandler<E>} [onError] - An optional error handler function.
 * @param {NotFoundHandler<E>} [onNotFound] - An optional not-found handler function.
 *
 * @returns {(context: C, next?: Function) => Promise<C>} - A composed middleware function.
 */
export declare const compose: <C extends ComposeContext, E extends Env = Env>(middleware: [
    [
        Function,
        unknown
    ],
    unknown
][] | [
    [
        Function
    ]
][], onError?: ErrorHandler<E>, onNotFound?: NotFoundHandler<E>) => ((context: C, next?: Function) => Promise<C>);
export {};
