import { Request, Response, IRouter, Application } from "express-serve-static-core";

interface ISubdomainConfigOption {
    router?: IRouter,
    viewsFolder: string|((subdomain:string)=>string)
}

interface ISubdomainConfig {
    [subdomain:string] : ISubdomainConfigOption
};

function generateViewCacheKey(viewsRoot:Array<string>|string, viewName:string){
    let root:string;
    if (Array.isArray(viewsRoot)) root = viewsRoot.join(",");
    else root = viewsRoot;
    return `${viewName}@${root}`;
}

function appRender(name:string, options?: object, callback?:(err:Error, html?:string)=>void):void {
    let merge = require('utils-merge');
    let cache = this.cache;
    let done = callback;
    let engines = this.engines;
    let opts:any = options;
    let renderOptions:any = {};
    let view;
    let cacheKey = generateViewCacheKey(this.get('views'), name);

    // support callback function as second arg
    if (typeof options === 'function') {
        done = <(err:Error, html:string)=>void>options;
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

    // primed cache
    if (renderOptions.cache) {
        view = cache[cacheKey];
    }

    // view
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
                : 'directory "' + view.root + '"'
            let err = new Error('Failed to lookup view "' + name + '" in views ' + dirs);
            err['view'] = view;
            return done?.(err);
        }

        // prime the cache
        if (renderOptions.cache) {
            cache[cacheKey] = view;
        }
    }

    // render
    try {
        view.render(renderOptions, done);
    } catch (err) {
        done?.(err);
    }
}

function overrideResRender(res:Response, onBeforeRender, onAfterRender){
    res.render = function(view:string, options?:object, callback?:(err:Error, html?:string)=>void) {
        var app = this.req.app;
        var done = callback;
        var opts:any = options || {};
        var req = this.req;
        var self = this;
      
        // support callback function as second arg
        if (typeof options === 'function') {
          done = <any>options;
          opts = {};
        }
      
        // merge res.locals
        opts._locals = self.locals;
      
        // default callback to respond
        done = done || function (err, str) {
          if (err) return req.next(err);
          self.send(str);
        };
      
        // render
        onBeforeRender();
        appRender.call(app, view, opts, (...args)=>{
            onAfterRender();
            done.apply(app,args);
        });
    }
}

function getMatchingConfig(req:Request, configs:ISubdomainConfig){
    let matches = Object.keys(configs).map(subdomain => {

        let subdomainSplit = subdomain.split('.').reverse();
        let match = true;

        subdomainSplit.some((expected:string, index:number)=>{
            if(expected !== '*'){

                let actual = req.subdomains[index];

                if (actual !== expected){
                    match = false;
                    return true; // exit the '.some' loop
                }

            }
        });

        if(match) return subdomain;
    }).filter(x => !!x);
    if (matches.length === 0) return {hasConfig: false};
    return {
        hasConfig: true,
        config: configs[ matches[0] ],
        subdomain: matches[0]
    };
}

let configsCollection:ISubdomainConfig = {};
let isMountedToApp = false;

export function withMultiView(app:Application, configs:ISubdomainConfig):Application{
    configsCollection = {...configsCollection, ...configs};
    if (isMountedToApp) return;
    isMountedToApp = true;

    app.use(function(req, res, next){
        let oldViewPaths = app.get("views");
        let match = getMatchingConfig(req, configsCollection);
        
        if (match.hasConfig){
            let path = typeof match.config.viewsFolder === "function" ? match.config.viewsFolder(match.subdomain) : match.config.viewsFolder;
            overrideResRender(res, ()=>{
                // change view
                app.set("views", path);
            }, ()=>{
                // reset view
                app.set("views", oldViewPaths);
            });
        }

        if (match.hasConfig && match.config.router){
            match.config.router(req, res, next);
        }
        else next();
    });

    return app;
}

export function defineSubdomainView(app:Application, subdomain:string, config:ISubdomainConfigOption):Application{
    let configs = {};
    configs[subdomain] = config;
    return withMultiView(app, configs);
}

module.exports = {
    withMultiView,
    defineSubdomainView
};

exports.withMultiView = withMultiView;
exports.defineSubdomainView = defineSubdomainView;
