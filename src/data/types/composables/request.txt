export type TRequestMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type TRequestInterceptor = (
    url: URL,
    options: IRequestOptions,
) => boolean | Promise<boolean>;

export type TResponseInterceptor = (response: Response) => void | Promise<void>;

export type TRequestSender = (
    method: TRequestMethods,
    href: string,
    options?: IRequestOptions,
) => Promise<Response>;

export interface IRequestOptions {
    options?: RequestInit;
    baseUrl?: string;
    params?: Record<string, unknown>;
}

type TRequestBindedSenders = {
    [METHOD in Lowercase<TRequestMethods>]: (
        href: string,
        options?: IRequestOptions,
    ) => Promise<Response>;
};

export interface IRequest extends TRequestBindedSenders {
    send: TRequestSender;
    addRequestInterceptor: (interceptor: TRequestInterceptor) => symbol;
    addResponseInterceptor: (interceptor: TResponseInterceptor) => symbol;
    removeInterceptor: (type: 'request' | 'response', interceptorId: symbol) => boolean;
}
