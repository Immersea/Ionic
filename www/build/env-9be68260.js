import './index-be90eba5.js';
import { a as isPlatform } from './ionic-global-c07767bf.js';

/*! Capacitor: https://capacitorjs.com/ - MIT License */
const createCapacitorPlatforms = (win) => {
    const defaultPlatformMap = new Map();
    defaultPlatformMap.set('web', { name: 'web' });
    const capPlatforms = win.CapacitorPlatforms || {
        currentPlatform: { name: 'web' },
        platforms: defaultPlatformMap,
    };
    const addPlatform = (name, platform) => {
        capPlatforms.platforms.set(name, platform);
    };
    const setPlatform = (name) => {
        if (capPlatforms.platforms.has(name)) {
            capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
        }
    };
    capPlatforms.addPlatform = addPlatform;
    capPlatforms.setPlatform = setPlatform;
    return capPlatforms;
};
const initPlatforms = (win) => (win.CapacitorPlatforms = createCapacitorPlatforms(win));
/**
 * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
 */
const CapacitorPlatforms = /*#__PURE__*/ initPlatforms((typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
            ? window
            : typeof global !== 'undefined'
                ? global
                : {}));
/**
 * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
 */
const addPlatform = CapacitorPlatforms.addPlatform;
/**
 * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
 */
const setPlatform = CapacitorPlatforms.setPlatform;

const legacyRegisterWebPlugin = (cap, webPlugin) => {
    var _a;
    const config = webPlugin.config;
    const Plugins = cap.Plugins;
    if (!(config === null || config === void 0 ? void 0 : config.name)) {
        // TODO: add link to upgrade guide
        throw new Error(`Capacitor WebPlugin is using the deprecated "registerWebPlugin()" function, but without the config. Please use "registerPlugin()" instead to register this web plugin."`);
    }
    // TODO: add link to upgrade guide
    console.warn(`Capacitor plugin "${config.name}" is using the deprecated "registerWebPlugin()" function`);
    if (!Plugins[config.name] || ((_a = config === null || config === void 0 ? void 0 : config.platforms) === null || _a === void 0 ? void 0 : _a.includes(cap.getPlatform()))) {
        // Add the web plugin into the plugins registry if there already isn't
        // an existing one. If it doesn't already exist, that means
        // there's no existing native implementation for it.
        // - OR -
        // If we already have a plugin registered (meaning it was defined in the native layer),
        // then we should only overwrite it if the corresponding web plugin activates on
        // a certain platform. For example: Geolocation uses the WebPlugin on Android but not iOS
        Plugins[config.name] = webPlugin;
    }
};

var ExceptionCode;
(function (ExceptionCode) {
    /**
     * API is not implemented.
     *
     * This usually means the API can't be used because it is not implemented for
     * the current platform.
     */
    ExceptionCode["Unimplemented"] = "UNIMPLEMENTED";
    /**
     * API is not available.
     *
     * This means the API can't be used right now because:
     *   - it is currently missing a prerequisite, such as network connectivity
     *   - it requires a particular platform or browser version
     */
    ExceptionCode["Unavailable"] = "UNAVAILABLE";
})(ExceptionCode || (ExceptionCode = {}));
class CapacitorException extends Error {
    constructor(message, code, data) {
        super(message);
        this.message = message;
        this.code = code;
        this.data = data;
    }
}
const getPlatformId = (win) => {
    var _a, _b;
    if (win === null || win === void 0 ? void 0 : win.androidBridge) {
        return 'android';
    }
    else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
        return 'ios';
    }
    else {
        return 'web';
    }
};

const createCapacitor = (win) => {
    var _a, _b, _c, _d, _e;
    const capCustomPlatform = win.CapacitorCustomPlatform || null;
    const cap = win.Capacitor || {};
    const Plugins = (cap.Plugins = cap.Plugins || {});
    /**
     * @deprecated Use `capCustomPlatform` instead, default functions like registerPlugin will function with the new object.
     */
    const capPlatforms = win.CapacitorPlatforms;
    const defaultGetPlatform = () => {
        return capCustomPlatform !== null
            ? capCustomPlatform.name
            : getPlatformId(win);
    };
    const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
    const defaultIsNativePlatform = () => getPlatform() !== 'web';
    const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
    const defaultIsPluginAvailable = (pluginName) => {
        const plugin = registeredPlugins.get(pluginName);
        if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            // JS implementation available for the current platform.
            return true;
        }
        if (getPluginHeader(pluginName)) {
            // Native implementation available.
            return true;
        }
        return false;
    };
    const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) ||
        defaultIsPluginAvailable;
    const defaultGetPluginHeader = (pluginName) => { var _a; return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find(h => h.name === pluginName); };
    const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
    const handleError = (err) => win.console.error(err);
    const pluginMethodNoop = (_target, prop, pluginName) => {
        return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
    };
    const registeredPlugins = new Map();
    const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
        const registeredPlugin = registeredPlugins.get(pluginName);
        if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
        }
        const platform = getPlatform();
        const pluginHeader = getPluginHeader(pluginName);
        let jsImplementation;
        const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
                jsImplementation =
                    typeof jsImplementations[platform] === 'function'
                        ? (jsImplementation = await jsImplementations[platform]())
                        : (jsImplementation = jsImplementations[platform]);
            }
            else if (capCustomPlatform !== null &&
                !jsImplementation &&
                'web' in jsImplementations) {
                jsImplementation =
                    typeof jsImplementations['web'] === 'function'
                        ? (jsImplementation = await jsImplementations['web']())
                        : (jsImplementation = jsImplementations['web']);
            }
            return jsImplementation;
        };
        const createPluginMethod = (impl, prop) => {
            var _a, _b;
            if (pluginHeader) {
                const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find(m => prop === m.name);
                if (methodHeader) {
                    if (methodHeader.rtype === 'promise') {
                        return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                    }
                    else {
                        return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                    }
                }
                else if (impl) {
                    return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
                }
            }
            else if (impl) {
                return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
            }
            else {
                throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
        };
        const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
                const p = loadPluginImplementation().then(impl => {
                    const fn = createPluginMethod(impl, prop);
                    if (fn) {
                        const p = fn(...args);
                        remove = p === null || p === void 0 ? void 0 : p.remove;
                        return p;
                    }
                    else {
                        throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                    }
                });
                if (prop === 'addListener') {
                    p.remove = async () => remove();
                }
                return p;
            };
            // Some flair ✨
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, 'name', {
                value: prop,
                writable: false,
                configurable: false,
            });
            return wrapper;
        };
        const addListener = createPluginMethodWrapper('addListener');
        const removeListener = createPluginMethodWrapper('removeListener');
        const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
                const callbackId = await call;
                removeListener({
                    eventName,
                    callbackId,
                }, callback);
            };
            const p = new Promise(resolve => call.then(() => resolve({ remove })));
            p.remove = async () => {
                console.warn(`Using addListener() without 'await' is deprecated.`);
                await remove();
            };
            return p;
        };
        const proxy = new Proxy({}, {
            get(_, prop) {
                switch (prop) {
                    // https://github.com/facebook/react/issues/20030
                    case '$$typeof':
                        return undefined;
                    case 'toJSON':
                        return () => ({});
                    case 'addListener':
                        return pluginHeader ? addListenerNative : addListener;
                    case 'removeListener':
                        return removeListener;
                    default:
                        return createPluginMethodWrapper(prop);
                }
            },
        });
        Plugins[pluginName] = proxy;
        registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: new Set([
                ...Object.keys(jsImplementations),
                ...(pluginHeader ? [platform] : []),
            ]),
        });
        return proxy;
    };
    const registerPlugin = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
    // Add in convertFileSrc for web, it will already be available in native context
    if (!cap.convertFileSrc) {
        cap.convertFileSrc = filePath => filePath;
    }
    cap.getPlatform = getPlatform;
    cap.handleError = handleError;
    cap.isNativePlatform = isNativePlatform;
    cap.isPluginAvailable = isPluginAvailable;
    cap.pluginMethodNoop = pluginMethodNoop;
    cap.registerPlugin = registerPlugin;
    cap.Exception = CapacitorException;
    cap.DEBUG = !!cap.DEBUG;
    cap.isLoggingEnabled = !!cap.isLoggingEnabled;
    // Deprecated props
    cap.platform = cap.getPlatform();
    cap.isNative = cap.isNativePlatform();
    return cap;
};
const initCapacitorGlobal = (win) => (win.Capacitor = createCapacitor(win));

const Capacitor = /*#__PURE__*/ initCapacitorGlobal(typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
            ? window
            : typeof global !== 'undefined'
                ? global
                : {});
const registerPlugin = Capacitor.registerPlugin;
/**
 * @deprecated Provided for backwards compatibility for Capacitor v2 plugins.
 * Capacitor v3 plugins should import the plugin directly. This "Plugins"
 * export is deprecated in v3, and will be removed in v4.
 */
const Plugins = Capacitor.Plugins;
/**
 * Provided for backwards compatibility. Use the registerPlugin() API
 * instead, and provide the web plugin as the "web" implmenetation.
 * For example
 *
 * export const Example = registerPlugin('Example', {
 *   web: () => import('./web').then(m => new m.Example())
 * })
 *
 * @deprecated Deprecated in v3, will be removed from v4.
 */
const registerWebPlugin = (plugin) => legacyRegisterWebPlugin(Capacitor, plugin);

/**
 * Base class web plugins should extend.
 */
class WebPlugin {
    constructor(config) {
        this.listeners = {};
        this.retainedEventArguments = {};
        this.windowListeners = {};
        if (config) {
            // TODO: add link to upgrade guide
            console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
            this.config = config;
        }
    }
    addListener(eventName, listenerFunc) {
        let firstListener = false;
        const listeners = this.listeners[eventName];
        if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
        }
        this.listeners[eventName].push(listenerFunc);
        // If we haven't added a window listener for this event and it requires one,
        // go ahead and add it
        const windowListener = this.windowListeners[eventName];
        if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
        }
        if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
        }
        const remove = async () => this.removeListener(eventName, listenerFunc);
        const p = Promise.resolve({ remove });
        return p;
    }
    async removeAllListeners() {
        this.listeners = {};
        for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
        }
        this.windowListeners = {};
    }
    notifyListeners(eventName, data, retainUntilConsumed) {
        const listeners = this.listeners[eventName];
        if (!listeners) {
            if (retainUntilConsumed) {
                let args = this.retainedEventArguments[eventName];
                if (!args) {
                    args = [];
                }
                args.push(data);
                this.retainedEventArguments[eventName] = args;
            }
            return;
        }
        listeners.forEach(listener => listener(data));
    }
    hasListeners(eventName) {
        return !!this.listeners[eventName].length;
    }
    registerWindowListener(windowEventName, pluginEventName) {
        this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: event => {
                this.notifyListeners(pluginEventName, event);
            },
        };
    }
    unimplemented(msg = 'not implemented') {
        return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
    }
    unavailable(msg = 'not available') {
        return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
    }
    async removeListener(eventName, listenerFunc) {
        const listeners = this.listeners[eventName];
        if (!listeners) {
            return;
        }
        const index = listeners.indexOf(listenerFunc);
        this.listeners[eventName].splice(index, 1);
        // If there are no more listeners for this type of event,
        // remove the window listener
        if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
        }
    }
    addWindowListener(handle) {
        window.addEventListener(handle.windowEventName, handle.handler);
        handle.registered = true;
    }
    removeWindowListener(handle) {
        if (!handle) {
            return;
        }
        window.removeEventListener(handle.windowEventName, handle.handler);
        handle.registered = false;
    }
    sendRetainedArgumentsForEvent(eventName) {
        const args = this.retainedEventArguments[eventName];
        if (!args) {
            return;
        }
        delete this.retainedEventArguments[eventName];
        args.forEach(arg => {
            this.notifyListeners(eventName, arg);
        });
    }
}

const WebView = /*#__PURE__*/ registerPlugin('WebView');
/******** END WEB VIEW PLUGIN ********/
/******** COOKIES PLUGIN ********/
/**
 * Safely web encode a string value (inspired by js-cookie)
 * @param str The string value to encode
 */
const encode = (str) => encodeURIComponent(str)
    .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
    .replace(/[()]/g, escape);
/**
 * Safely web decode a string value (inspired by js-cookie)
 * @param str The string value to decode
 */
const decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
class CapacitorCookiesPluginWeb extends WebPlugin {
    async getCookies() {
        const cookies = document.cookie;
        const cookieMap = {};
        cookies.split(';').forEach(cookie => {
            if (cookie.length <= 0)
                return;
            // Replace first "=" with CAP_COOKIE to prevent splitting on additional "="
            let [key, value] = cookie.replace(/=/, 'CAP_COOKIE').split('CAP_COOKIE');
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
        });
        return cookieMap;
    }
    async setCookie(options) {
        try {
            // Safely Encoded Key/Value
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            // Clean & sanitize options
            const expires = `; expires=${(options.expires || '').replace('expires=', '')}`; // Default is "; expires="
            const path = (options.path || '/').replace('path=', ''); // Default is "path=/"
            const domain = options.url != null && options.url.length > 0
                ? `domain=${options.url}`
                : '';
            document.cookie = `${encodedKey}=${encodedValue || ''}${expires}; path=${path}; ${domain};`;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async deleteCookie(options) {
        try {
            document.cookie = `${options.key}=; Max-Age=0`;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async clearCookies() {
        try {
            const cookies = document.cookie.split(';') || [];
            for (const cookie of cookies) {
                document.cookie = cookie
                    .replace(/^ +/, '')
                    .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async clearAllCookies() {
        try {
            await this.clearCookies();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}
const CapacitorCookies = registerPlugin('CapacitorCookies', {
    web: () => new CapacitorCookiesPluginWeb(),
});
// UTILITY FUNCTIONS
/**
 * Read in a Blob value and return it as a base64 string
 * @param blob The blob value to convert to a base64 string
 */
const readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const base64String = reader.result;
        // remove prefix "data:application/pdf;base64,"
        resolve(base64String.indexOf(',') >= 0
            ? base64String.split(',')[1]
            : base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
});
/**
 * Normalize an HttpHeaders map by lowercasing all of the values
 * @param headers The HttpHeaders object to normalize
 */
const normalizeHttpHeaders = (headers = {}) => {
    const originalKeys = Object.keys(headers);
    const loweredKeys = Object.keys(headers).map(k => k.toLocaleLowerCase());
    const normalized = loweredKeys.reduce((acc, key, index) => {
        acc[key] = headers[originalKeys[index]];
        return acc;
    }, {});
    return normalized;
};
/**
 * Builds a string of url parameters that
 * @param params A map of url parameters
 * @param shouldEncode true if you should encodeURIComponent() the values (true by default)
 */
const buildUrlParams = (params, shouldEncode = true) => {
    if (!params)
        return null;
    const output = Object.entries(params).reduce((accumulator, entry) => {
        const [key, value] = entry;
        let encodedValue;
        let item;
        if (Array.isArray(value)) {
            item = '';
            value.forEach(str => {
                encodedValue = shouldEncode ? encodeURIComponent(str) : str;
                item += `${key}=${encodedValue}&`;
            });
            // last character will always be "&" so slice it off
            item.slice(0, -1);
        }
        else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
        }
        return `${accumulator}&${item}`;
    }, '');
    // Remove initial "&" from the reduce
    return output.substr(1);
};
/**
 * Build the RequestInit object based on the options passed into the initial request
 * @param options The Http plugin options
 * @param extra Any extra RequestInit values
 */
const buildRequestInit = (options, extra = {}) => {
    const output = Object.assign({ method: options.method || 'GET', headers: options.headers }, extra);
    // Get the content-type
    const headers = normalizeHttpHeaders(options.headers);
    const type = headers['content-type'] || '';
    // If body is already a string, then pass it through as-is.
    if (typeof options.data === 'string') {
        output.body = options.data;
    }
    // Build request initializers based off of content-type
    else if (type.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
        }
        output.body = params.toString();
    }
    else if (type.includes('multipart/form-data') ||
        options.data instanceof FormData) {
        const form = new FormData();
        if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
                form.append(key, value);
            });
        }
        else {
            for (const key of Object.keys(options.data)) {
                form.append(key, options.data[key]);
            }
        }
        output.body = form;
        const headers = new Headers(output.headers);
        headers.delete('content-type'); // content-type will be set by `window.fetch` to includy boundary
        output.headers = headers;
    }
    else if (type.includes('application/json') ||
        typeof options.data === 'object') {
        output.body = JSON.stringify(options.data);
    }
    return output;
};
// WEB IMPLEMENTATION
class CapacitorHttpPluginWeb extends WebPlugin {
    /**
     * Perform an Http request given a set of options
     * @param options Options to build the HTTP request
     */
    async request(options) {
        const requestInit = buildRequestInit(options, options.webFetchExtra);
        const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
        const url = urlParams ? `${options.url}?${urlParams}` : options.url;
        const response = await fetch(url, requestInit);
        const contentType = response.headers.get('content-type') || '';
        // Default to 'text' responseType so no parsing happens
        let { responseType = 'text' } = response.ok ? options : {};
        // If the response content-type is json, force the response to be json
        if (contentType.includes('application/json')) {
            responseType = 'json';
        }
        let data;
        let blob;
        switch (responseType) {
            case 'arraybuffer':
            case 'blob':
                blob = await response.blob();
                data = await readBlobAsBase64(blob);
                break;
            case 'json':
                data = await response.json();
                break;
            case 'document':
            case 'text':
            default:
                data = await response.text();
        }
        // Convert fetch headers to Capacitor HttpHeaders
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        return {
            data,
            headers,
            status: response.status,
            url: response.url,
        };
    }
    /**
     * Perform an Http GET request given a set of options
     * @param options Options to build the HTTP request
     */
    async get(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'GET' }));
    }
    /**
     * Perform an Http POST request given a set of options
     * @param options Options to build the HTTP request
     */
    async post(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'POST' }));
    }
    /**
     * Perform an Http PUT request given a set of options
     * @param options Options to build the HTTP request
     */
    async put(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'PUT' }));
    }
    /**
     * Perform an Http PATCH request given a set of options
     * @param options Options to build the HTTP request
     */
    async patch(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'PATCH' }));
    }
    /**
     * Perform an Http DELETE request given a set of options
     * @param options Options to build the HTTP request
     */
    async delete(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'DELETE' }));
    }
}
const CapacitorHttp = registerPlugin('CapacitorHttp', {
    web: () => new CapacitorHttpPluginWeb(),
});

const ISDEV = true;

var AppNames;
(function (AppNames) {
    AppNames["decoplanner"] = "decoplanner";
    AppNames["udive"] = "udive";
    AppNames["trasteel"] = "trasteel";
})(AppNames || (AppNames = {}));
const selectedApp = AppNames.decoplanner;

var AppTitles;
(function (AppTitles) {
    AppTitles["udive"] = "U-Dive";
    AppTitles["decoplanner"] = "Decoplanner";
    AppTitles["trasteel"] = "Trasteel";
})(AppTitles || (AppTitles = {}));
var AppSubTitles;
(function (AppSubTitles) {
    AppSubTitles["udive"] = "Dive, Explore, Share";
    AppSubTitles["decoplanner"] = "Online";
    AppSubTitles["trasteel"] = "Consumables department";
})(AppSubTitles || (AppSubTitles = {}));
var AppVersions;
(function (AppVersions) {
    AppVersions["udive"] = "beta 1.1.1";
    AppVersions["decoplanner"] = "1.4.0";
    AppVersions["trasteel"] = "1.3.9";
})(AppVersions || (AppVersions = {}));
const firebase_settings = {
    TRASTEEL: {
        apiKey: "AIzaSyBAcEFeZE0dltFPxfSoOJ_llE4UaD7iq00",
        authDomain: "trasteel-consumables.firebaseapp.com",
        projectId: "trasteel-consumables",
        storageBucket: "trasteel-consumables.appspot.com",
        messagingSenderId: "260293051543",
        appId: "1:260293051543:web:776561f763150002de95d2",
        measurementId: "G-8ZKKV1CP6R",
    },
    UDIVE: {
        apiKey: "AIzaSyCBxu4H6gznmMjjtyJC4E5tHBsvjcz9Gvo",
        authDomain: "u-dive-cloud-prod.firebaseapp.com",
        databaseURL: "https://u-dive-cloud-prod.firebaseio.com",
        projectId: "u-dive-cloud-prod",
        storageBucket: "u-dive-cloud-prod.appspot.com",
        messagingSenderId: "352375493863",
        appId: "1:352375493863:web:7a0df180088ea8e6dffe42",
        measurementId: "G-VMMT8STTSV",
        vapidKey: "BHUKjUbPorRLiLAkBHJIWpIbukBW2OZae40DArnshzhd4WCiS6PpBSXtULf9lXBolTTexGekINCZWaQ5-iQLYaY",
    },
    DECOPLANNER: {
        apiKey: "AIzaSyCBxu4H6gznmMjjtyJC4E5tHBsvjcz9Gvo",
        authDomain: "u-dive-cloud-prod.firebaseapp.com",
        databaseURL: "https://u-dive-cloud-prod.firebaseio.com",
        projectId: "u-dive-cloud-prod",
        storageBucket: "u-dive-cloud-prod.appspot.com",
        messagingSenderId: "352375493863",
        appId: "1:352375493863:web:1644f6a60d57ff0adffe42",
        measurementId: "G-D642PPJCHE",
        vapidKey: "BHUKjUbPorRLiLAkBHJIWpIbukBW2OZae40DArnshzhd4WCiS6PpBSXtULf9lXBolTTexGekINCZWaQ5-iQLYaY",
    },
};
const siteUrls = {
    LOCALHOST: "http://localhost:3333",
    TRASTEEL: "https://trasteel-consumables.web.app",
    UDIVE: "https://app.u-dive.cloud",
    DECOPLANNER: "https://guedecoplanner.web.app",
};
const cloudFunctionsUrls = {
    TRASTEEL: "https://europe-west1-u-dive-cloud-dev.cloudfunctions.net/",
    UDIVE: "https://europe-west1-u-dive-cloud-prod.cloudfunctions.net/",
    DECOPLANNER: "https://europe-west1-u-dive-cloud-prod.cloudfunctions.net/",
};
const dynamicLinkDomain = {
    TRASTEEL: "trasteel.page.link",
    UDIVE: "udive.page.link",
    DECOPLANNER: "decoplanner.page.link",
};
const bundleId = {
    TRASTEEL: "com.trasteel.app",
    UDIVE: "cloud.udive.app",
    DECOPLANNER: isPlatform("android")
        ? "cloud.udive.app"
        : isPlatform("ios")
            ? "com.gue.decoplanner-mobile"
            : "com.gue.decoplanner-mobile-web",
};
const MAPBOX = "pk.eyJ1IjoidWRpdmUiLCJhIjoiY2s2dDRlbHQyMDNyOTNsbXlraXQ2dzhxaSJ9.CYFNebHv6aQWw3W348wwog";
const LOCATIONIQ_GEOCODE = "pk.4e444afb4eadab2a91b57f961f23c297";
const CURRENCY_API = "c70d97d8927a21f913ee1ce6e49b6120";
class EnvController {
    constructor() {
        this.appName = selectedApp;
    }
    getAppTitle() {
        let title = "";
        let subtitle = "";
        let $webapptitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        let $description = document.querySelector('meta[name="description"]');
        if (this.isUdive()) {
            title = AppTitles.udive;
            subtitle = AppSubTitles.udive;
        }
        else if (this.isDecoplanner()) {
            title = AppTitles.decoplanner;
            subtitle = AppSubTitles.decoplanner;
        }
        else if (this.isTrasteel()) {
            title = AppTitles.trasteel;
            subtitle = AppSubTitles.trasteel;
        }
        document.title = title + (subtitle !== "" ? "-" + subtitle : "");
        $webapptitle.content = title + (subtitle !== "" ? "-" + subtitle : "");
        $description.content = subtitle !== "" ? "-" + subtitle : "";
        return title;
    }
    getAppSubTitle() {
        let subtitle = "";
        if (this.isUdive()) {
            subtitle = AppSubTitles.udive;
        }
        else if (this.isDecoplanner()) {
            subtitle = isPlatform("capacitor") ? "Mobile" : AppSubTitles.decoplanner;
        }
        else if (this.isTrasteel()) {
            subtitle = AppSubTitles.trasteel;
        }
        return subtitle;
    }
    getAppColor() {
        if (this.isUdive()) {
            return "gue-blue";
        }
        else if (this.isDecoplanner()) {
            return "gue-blue";
        }
        else if (this.isTrasteel()) {
            return "trasteel";
        }
    }
    getAppSplashColor() {
        if (this.isUdive()) {
            return "--ion-color-gue-blue";
        }
        else if (this.isDecoplanner()) {
            return "--ion-color-light";
        }
        else if (this.isTrasteel()) {
            return "--ion-color-trasteel";
        }
    }
    getAppLogo() {
        if (this.isUdive()) {
            return "logo_udive.png";
        }
        else if (this.isDecoplanner()) {
            return "logo_decoplanner.png";
        }
        else if (this.isTrasteel()) {
            return "logo_trasteel.png";
        }
    }
    getMenuColor() {
        if (this.isUdive()) {
            return "gue-grey";
        }
        else if (this.isDecoplanner()) {
            return "gue-grey";
        }
        else if (this.isTrasteel()) {
            return "trasteel";
        }
    }
    getAppVersion() {
        if (this.isUdive()) {
            return AppVersions.udive;
        }
        else if (this.isDecoplanner()) {
            return AppVersions.decoplanner;
        }
        else if (this.isTrasteel()) {
            return AppVersions.trasteel;
        }
    }
    getElectronCustomUrl() {
        if (this.isUdive()) {
            return "udive-app";
        }
        else if (this.isDecoplanner()) {
            return "decoplanner-app";
        }
        else if (this.isTrasteel()) {
            return "trasteel-app";
        }
    }
    getElectronAppProtocol() {
        if (this.isUdive()) {
            return "udive-electron";
        }
        else if (this.isDecoplanner()) {
            return "decoplanner-electron";
        }
        else if (this.isTrasteel()) {
            return "trasteel-electron";
        }
    }
    changeIcons() {
        let favicon = null;
        let touchicon = null;
        if (this.isUdive()) {
            favicon = "assets/icon/favicon_udive.ico";
            touchicon = "assets/icon/apple-touch-icon-udive.ico";
        }
        else if (this.isDecoplanner()) {
            favicon = "assets/icon/favicon_decoplanner.ico";
            touchicon = "assets/icon/apple-touch-icon-decoplanner.ico";
        }
        else if (this.isTrasteel()) {
            favicon = "assets/icon/favicon_trasteel.ico";
            touchicon = "assets/icon/apple-touch-icon-trasteel.ico";
        }
        let $favicon = document.querySelector('link[rel="icon"]');
        let $touchicon = document.querySelector('link[rel="apple-touch-icon"]');
        // If a <link rel="icon"> element already exists,
        // change its href to the given link.
        if ($favicon !== null) {
            $favicon.href = favicon;
            $touchicon.href = touchicon;
            // Otherwise, create a new element and append it to <head>.
        }
        else {
            $favicon = document.createElement("link");
            $favicon.rel = "icon";
            $favicon.href = favicon;
            document.head.appendChild($favicon);
            $touchicon = document.createElement("link");
            $touchicon.rel = "apple-touch-icon";
            $touchicon.href = touchicon;
            document.head.appendChild($touchicon);
        }
    }
    isTrasteel() {
        return this.appName === AppNames.trasteel;
    }
    isDecoplanner() {
        return this.appName === AppNames.decoplanner;
    }
    isUdive() {
        return this.appName === AppNames.udive;
    }
    getFirebaseSettings() {
        if (this.appName === AppNames.udive) {
            return firebase_settings.UDIVE;
        }
        else if (this.appName === AppNames.decoplanner) {
            return firebase_settings.UDIVE;
        }
        else if (this.appName === AppNames.trasteel) {
            return firebase_settings.TRASTEEL;
        }
    }
    getSiteUrl() {
        if (this.isDev()) {
            return siteUrls.LOCALHOST;
        }
        else if (this.appName === AppNames.udive) {
            return siteUrls.UDIVE;
        }
        else if (this.appName === AppNames.decoplanner) {
            return siteUrls.DECOPLANNER;
        }
        else if (this.appName === AppNames.trasteel) {
            return siteUrls.TRASTEEL;
        }
    }
    getCloudFunctionsUrl() {
        if (this.appName === AppNames.udive) {
            return cloudFunctionsUrls.UDIVE;
        }
        else if (this.appName === AppNames.decoplanner) {
            return cloudFunctionsUrls.DECOPLANNER;
        }
        else if (this.appName === AppNames.trasteel) {
            return cloudFunctionsUrls.TRASTEEL;
        }
    }
    getDynamicLinkDomain() {
        if (this.appName === AppNames.udive) {
            return dynamicLinkDomain.UDIVE;
        }
        else if (this.appName === AppNames.decoplanner) {
            return dynamicLinkDomain.DECOPLANNER;
        }
        else if (this.appName === AppNames.trasteel) {
            return dynamicLinkDomain.TRASTEEL;
        }
    }
    getBundleId() {
        if (this.appName === AppNames.udive) {
            return bundleId.UDIVE;
        }
        else if (this.appName === AppNames.decoplanner) {
            return bundleId.DECOPLANNER;
        }
        else if (this.appName === AppNames.trasteel) {
            return bundleId.TRASTEEL;
        }
    }
    isDev() {
        return ISDEV;
    }
    log(message, data) {
        if (this.isDev()) {
            if (data) {
                console.log(message, Capacitor.isNativePlatform() ? JSON.stringify(data) : data);
            }
            else {
                console.log(message);
            }
        }
    }
}
const Environment = new EnvController();

export { Capacitor as C, Environment as E, LOCATIONIQ_GEOCODE as L, MAPBOX as M, WebPlugin as W, CURRENCY_API as a, buildRequestInit as b, registerPlugin as r };

//# sourceMappingURL=env-9be68260.js.map