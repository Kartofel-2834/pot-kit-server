import type {
    IRequest,
    IRequestOptions,
    TRequestInterceptor,
    TRequestMethods,
    TResponseInterceptor,
} from '@/types/composables/request';

export function useRequest(baseUrl?: string, requestInit?: RequestInit): IRequest {
    const requestInterceptors: Map<symbol, TRequestInterceptor> = new Map();
    const responseInterceptors: Map<symbol, TResponseInterceptor> = new Map();

    async function send(
        method: TRequestMethods,
        href: string,
        options: IRequestOptions = {},
    ): Promise<Response> {
        const currentOptions = getRequestOptions(options);
        const url = useRequestUrl(href, currentOptions.params, currentOptions.baseUrl);
        const flags: boolean[] = [];

        for (const interceptor of requestInterceptors.values()) {
            flags.push(await interceptor(url, currentOptions));
        }

        if (flags.includes(false)) {
            throw new Error('[useRequest.send] request aborted');
        }

        return fetch(url, {
            ...currentOptions.options,
            method,
        }).then(async response => {
            for (const interceptor of responseInterceptors.values()) {
                await interceptor(response);
            }

            return response;
        });
    }

    function addRequestInterceptor(interceptor: TRequestInterceptor): symbol {
        const id = Symbol(Math.ceil(Math.random() * 10000));
        requestInterceptors.set(id, interceptor);
        return id;
    }

    function addResponseInterceptor(interceptor: TResponseInterceptor): symbol {
        const id = Symbol(Math.ceil(Math.random() * 10000));
        responseInterceptors.set(id, interceptor);
        return id;
    }

    function removeInterceptor(type: 'request' | 'response', interceptorId: symbol): boolean {
        const target = type === 'request' ? requestInterceptors : responseInterceptors;
        return target.delete(interceptorId);
    }

    function getRequestOptions(options: IRequestOptions): IRequestOptions {
        return {
            baseUrl: baseUrl ?? window?.location?.href ?? '/',
            ...options,
            options: {
                ...requestInit,
                ...options.options,
            },
        };
    }

    return {
        get: (...args) => send('GET', ...args),
        post: (...args) => send('POST', ...args),
        put: (...args) => send('PUT', ...args),
        patch: (...args) => send('PATCH', ...args),
        delete: (...args) => send('DELETE', ...args),
        send,
        addRequestInterceptor,
        addResponseInterceptor,
        removeInterceptor,
    };
}

export function useRequestUrl(href: string, params?: Record<string, unknown>, base?: string): URL {
    let createdUrl: URL;

    if (base) {
        const baseUrl = new URL(base);
        const pathname = [baseUrl.pathname, href].filter(Boolean).join('/').replace(/\/+/gm, '/');

        createdUrl = new URL(pathname, base);
    } else {
        createdUrl = new URL(href);
    }

    if (!params) {
        return createdUrl;
    }

    function parseValue(value: unknown): string {
        if (['string', 'number', 'boolean'].includes(typeof value)) {
            return `${value}`;
        }

        if (value === null || value === undefined || typeof value !== 'object') {
            return '';
        }

        try {
            return JSON.stringify(value);
        } catch (err) {
            console.warn('[useRequestUrl] JSON stringify error:', err);
            return '';
        }
    }

    Object.entries(params).forEach(([key, value]) => {
        const values = Array.isArray(value) ? value : [value];

        values
            .map(v => parseValue(v))
            .filter(Boolean)
            .forEach(v => createdUrl.searchParams.append(key, v));
    });

    return createdUrl;
}
