import {Dict} from '../interfaces';

export interface XhrResponse {
    data: any;
    statusCode: number;
    statusText: string;
    headers: Dict;
    request: XMLHttpRequest;
    code?: string;
}

export interface XhrError extends Error {
    code: string;
    config: Dict;
    response?: {
        statusCode: number;
        statusText: string;
        headers?: Dict;
    };
}

export interface XhrRequestParams {
    method: string;
    data?: any;
    params?: any;
    withCredentials?: boolean;
    timeout?: number;
    headers?: Dict;
    simple?: boolean;
    url: string;
    parseJSON?: boolean;
    responseType?: XMLHttpRequestResponseType;
}

/**
 * add params to error
 */
function enhanceError(message: string, config: Dict, response?: XhrResponse | null, code?: string): XhrError {
    let error = new Error(message) as XhrError;

    if (response) {
        error.response = {
            statusCode: response.statusCode,
            statusText: response.statusText,
            headers: response.headers,
        };
    }

    if (code) {
        error.code = code;
    }

    error.config = config;

    return error;
}

/**
 * safe encode
 */
function encode(val: string): string {
    return encodeURIComponent(val)
        .replace(/%40/gi, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/gi, ',')
        .replace(/%20/g, '+')
        .replace(/%5B/gi, '[')
        .replace(/%5D/gi, ']');
}

/**
 * build url with query
 */
function buildURL(url: string, params?: Dict): string {
    if (!params) {
        return url;
    }

    let serializedParams;

    if (typeof URLSearchParams !== 'undefined' && params instanceof URLSearchParams) {
        serializedParams = params.toString();
    } else {
        let parts: string[] = [];

        Object.keys(params).forEach(function (key) {
            let val = params[key];

            if (val === null || typeof val === 'undefined') {
                return;
            }

            if (Object.prototype.toString.call(val) === '[object Array]') {
                key = key + '[]';
            } else {
                val = [val];
            }

            Object.keys(val).forEach(function (k) {
                let v = val[k];

                if (Object.prototype.toString.call(v) === '[object Date]') {
                    v = v.toISOString();
                } else if (typeof v === 'object') {
                    v = JSON.stringify(v);
                }

                parts.push(encode(key) + '=' + encode(v));
            });
        });

        serializedParams = parts.join('&');
    }

    if (serializedParams) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
}

/**
 * parse headers with cookies
 */
function parseHeaders(headers: string): Dict {
    let parsed: Dict = {};

    if (!headers) {
        return parsed;
    }

    headers.split('\n').forEach(function parser(line) {
        let i = line.indexOf(':');
        let key = line.substr(0, i).trim().toLowerCase();
        let val = line.substr(i + 1).trim();

        if (key) {
            if (key === 'set-cookie') {
                parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
            } else {
                parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
            }
        }
    });

    return parsed;
}

/**
 * process xhrRequest result
 */
function settle(resolve: Function, reject: Function, config: Dict, response: XhrResponse) {
    let {statusCode} = response;

    if (!statusCode || (statusCode >= 200 && statusCode < 300)) {
        resolve(response);
    } else {
        reject(enhanceError(
            'Request failed with status code ' + response.statusCode,
            config,
            response
        ));
    }
}

/**
 * make xhr request
 */
export function xhrRequest(options: XhrRequestParams): Promise<XhrResponse> {
    return new Promise((resolve: Function, reject: Function) => {
        let request = new XMLHttpRequest();
        let requestData = options.data;
        let requestHeaders = options.headers || {};
        let parseJSON = typeof options.parseJSON === 'boolean' ? options.parseJSON : true;

        if (requestData instanceof FormData || options.simple) {
            delete requestHeaders['Content-Type']; // Let the browser set header
        } else {
            requestHeaders['Content-Type'] = 'application/json';
        }

        if (typeof requestData === 'object') {
            requestData = JSON.stringify(requestData);
        }

        request.open(options.method.toUpperCase(), buildURL(options.url, options.params), true);

        if (options.withCredentials) {
            request.withCredentials = true;
        }

        if (options.timeout) {
            request.timeout = options.timeout;
        }

        request.responseType = options.responseType || 'json';

        request.onreadystatechange = () => {
            if (!request || request.readyState !== 4) {
                return;
            }

            // onerror
            if (request.status === 0) {
                return;
            }

            let responseHeaders = parseHeaders(request.getAllResponseHeaders());
            let responseData = request.response;

            if (parseJSON && request.response) {
                try {
                    responseData = JSON.parse(responseData);
                } catch (e) {
                    // still allow to receive response
                }
            }

            settle(resolve, reject, options, {
                data: responseData,
                statusCode: request.status,
                statusText: request.status === 1223 ? 'No Content' : request.statusText,
                headers: responseHeaders,
                request: request,
            });
        };

        request.ontimeout = () => reject(enhanceError(
            'Timeout of ' + options.timeout + 'ms exceeded',
            options,
            null,
            'ECONNABORTED'
        ));

        request.onerror = () => reject(enhanceError('Network Error', options, {
            data: '',
            statusCode: 0,
            statusText: 'Network Error',
            headers: {},
            request: request,
        }));

        if (!options.simple) {
            Object.keys(requestHeaders).forEach((key) => {
                let val = requestHeaders[key];

                if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
                    delete requestHeaders[key];
                } else {
                    request.setRequestHeader(key, val);
                }
            });
        }

        if (typeof requestData === 'undefined') {
            requestData = null;
        }

        request.send(requestData);
    });
}