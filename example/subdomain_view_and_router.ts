(function(){

    const express = require('express');
    const multiview = require('express-multiview');
    const app = express();

    const adminRouter = express.Router();
    const dashboardRouter = express.Router();
    
    adminRouter.get('/', function(req, res){
        // calling render here will render views from the /views/admin/ folder
        res.render('homepage');
    });

    dashboardRouter.get('/', function(req, res){
        // calling render here will render views from the /views/dashboard/ folder
        res.render('homepage');
    });

    // use the following to define the views for each subdomain and/or its express router
    multiview.withMultiView(app,{
        'admin' : { 
            viewsFolder: '/views/admin/',
            router: adminRouter
        },
        'dashboard' : { 
            viewsFolder: '/views/dashboard/',
            router: dashboardRouter
        }
    });

    
    // other paths and middleware go here
    app.get('/', function (req, res) {
        // calling render here will render from the default views folder
        res.render('homepage');
    });

})();
