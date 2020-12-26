"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withMultiView = void 0;
function generateViewCacheKey(viewsRoot, viewName) {
    let root;
    if (Array.isArray(viewsRoot))
        root = viewsRoot.join(",");
    else
        root = viewsRoot;
    return `${viewName}@${root}`;
}
function appRender(name, options, callback) {
    let merge = require('utils-merge');
    let cache = this.cache;
    let done = callback;
    let engines = this.engines;
    let opts = options;
    let renderOptions = {};
    let view;
    let cacheKey = generateViewCacheKey(this.get('views'), name);
    if (typeof options === 'function') {
        done = options;
        opts = {};
    }
    merge(renderOptions, this.locals);
    if (opts._locals) {
        merge(renderOptions, opts._locals);
    }
    merge(renderOptions, opts);
    if (renderOptions.cache == null) {
        renderOptions.cache = this.enabled('view cache');
    }
    if (renderOptions.cache) {
        view = cache[cacheKey];
    }
    if (!view) {
        let View = this.get('view');
        view = new View(name, {
            defaultEngine: this.get('view engine'),
            root: this.get('views'),
            engines: engines
        });
        if (!view.path) {
            let dirs = Array.isArray(view.root) && view.root.length > 1
                ? 'directories "' + view.root.slice(0, -1).join('", "') + '" or "' + view.root[view.root.length - 1] + '"'
                : 'directory "' + view.root + '"';
            let err = new Error('Failed to lookup view "' + name + '" in views ' + dirs);
            err['view'] = view;
            return done === null || done === void 0 ? void 0 : done(err);
        }
        if (renderOptions.cache) {
            cache[cacheKey] = view;
        }
    }
    try {
        view.render(renderOptions, done);
    }
    catch (err) {
        done === null || done === void 0 ? void 0 : done(err);
    }
}
function overrideResRender(res, onBeforeRender, onAfterRender) {
    res.render = function (view, options, callback) {
        var app = this.req.app;
        var done = callback;
        var opts = options || {};
        var req = this.req;
        var self = this;
        if (typeof options === 'function') {
            done = options;
            opts = {};
        }
        opts._locals = self.locals;
        done = done || function (err, str) {
            if (err)
                return req.next(err);
            self.send(str);
        };
        onBeforeRender();
        appRender.call(app, view, opts, (...args) => {
            onAfterRender();
            done.apply(app, args);
        });
    };
}
function getMatchingConfig(req, configs) {
    let matches = Object.keys(configs).map(subdomain => {
        let subdomainSplit = subdomain.split('.').reverse();
        let match = true;
        subdomainSplit.some((expected, index) => {
            if (expected !== '*') {
                let actual = req.subdomains[index];
                if (actual !== expected) {
                    match = false;
                    return true;
                }
            }
        });
        if (match)
            return subdomain;
    }).filter(x => !!x);
    if (matches.length === 0)
        return { hasConfig: false };
    return {
        hasConfig: true,
        config: configs[matches[0]],
        subdomain: matches[0]
    };
}
function withMultiView(app, configs) {
    app.use(function (req, res, next) {
        let oldViewPaths = app.get("views");
        let match = getMatchingConfig(req, configs);
        if (match.hasConfig) {
            let path = typeof match.config.viewsFolder === "function" ? match.config.viewsFolder(match.subdomain) : match.config.viewsFolder;
            overrideResRender(res, () => {
                app.set("views", path);
            }, () => {
                app.set("views", oldViewPaths);
            });
        }
        if (match.hasConfig && match.config.router) {
            match.config.router(req, res, next);
        }
        else
            next();
    });
    return app;
}
exports.withMultiView = withMultiView;
module.exports = {
    withMultiView
};
exports.withMultiView = withMultiView;
//# sourceMappingURL=index.js.map