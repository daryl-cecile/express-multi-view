(function(){

    const express = require('express');
    const multiview = require('express-multiview');
    
    const app = express();
    
    // OPTION 1
    multiview.defineSubdomainView(app, 'admin', {
        viewsFolder: '/views/admin/'
    });
    multiview.defineSubdomainView(app, 'dashboard', {
        viewsFolder: '/views/dashboard/'
    });

    //OPTION 2
    multiview.withMultiView(app,{
        'admin' : { viewsFolder: '/views/admin/' },
        'dashboard' : { viewsFolder: '/views/dashboard/' }
    });
    
    app.get('/', function (req, res) {
        /*
            admin.yoursite.com will render /views/admin/homepage.ejs
            dashboard.yoursite.com will render /views/admin/dashboard/homepage.ejs
        */
        res.render('homepage.ejs');
    });

})();
