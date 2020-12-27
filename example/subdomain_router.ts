(function(){

    const express = require('express');
    const multiview = require('express-multiview');
    
    const app = express();
    
    const adminRouter = express.Router();
    
    adminRouter.get('/', function(req, res){
        res.send('Hello Admin');
    });
    
    multiview.defineSubdomainView(app, 'admin', {
        router: adminRouter
    });
    
    app.get('/', function (req, res) {
        res.send('Hello World');
    });
    
    /*
        Going to example.com will render "Hello World";
        Going to admin.example.com will render "Hello Admin";
    */

})();