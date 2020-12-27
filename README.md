# express-multiview

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

## Install
```sh
$ npm install express-multiview
```

## API

<!-- eslint-disable no-unused-vars -->
```js
let multiview = require("express-multiview");
```


### multiview.withMultiView(app, configs)

Creates definition for multiple subdomains on the app. Unlike the `.defineSubdomainView()` method, this method allows you to define configurations for multiple subdomains. `configs` is an object containing the subdomain as key, and a subdomainConfig as value. For each subdomain, an optional `viewsFolder` can be specified, as well as an optional `router` option which takes in an express router.

```js
const multiview = require("express-multiview");
const app = express();

const customRouter = express.Router();
customRouter.get('/', function(req, res){
    res.send("Hello from subdomain");
});

multiview.withMultiView(app, {
    "docs":{
        viewsFolder: "/views/docs", //optional
        router: customRouter        //optional
    },
    "another.sub":{
        ...
    }
});
```

In the example above, requests from docs.yoursite.com will render views from the /views/docs/ folder, and will handle requests in the customRouter. It is recommended that you specify at least a `viewsFolder` or `router`.


### multiview.defineSubdomainView(app, subdomain, config)

This method allows you to define a single subdomain configuration. 

```js
const multiview = require("express-multiview");
const app = express();

const customRouter = express.Router();
customRouter.get('/', function(req, res){
    res.send("Hello from subdomain");
});

multiview.defineSubdomainView(app, "docs", {
    viewsFolder: "/views/docs",     // optional
    router: customRouter            // optional
});
```

## Developing Locally

In order to use this middleware locally, you'll need to
list the subdomain in your hosts file.

On *nix systems, add your subdomain to `/etc/hosts`:
```
127.0.0.1       yoursite.com
127.0.0.1       subdomain.yoursite.com
```

On Windows 7/8, the hosts file can be found in `%systemroot%\system32\drivers\etc`.


## Notes


_1_: It is not possible to dev locally with this middleware without the above setup

_2_: It is important that you define the subdomain configs before the app router for the main domain. 

_3_: For multilevel TLD's, such as `.co.uk` you need to pass a value in the third parameter of the `defineSubdomainView()` and/or `withMultiView()` methods. The third parameter takes in subdomain offset value which is passed straight to expressjs. The value for `.co.uk` would be 3, and for `.com` it would be 2 (default)


## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/express-multiview.svg
[npm-url]: https://npmjs.org/package/express-multiview
[downloads-image]: https://img.shields.io/npm/dm/express-multiview.svg
[downloads-url]: https://npmjs.org/package/express-multiview

