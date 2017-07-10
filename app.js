'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing

const TOKEN = 'Ss-^3EnbsM`Mbp(#ou2})&wXYn|Pu';
var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    Bearer: function (req, authOrSecDef, scopesOrApiKey, callback) {
      if (scopesOrApiKey === TOKEN) {
        callback();
      } else {
        callback(new Error('API Key not matched'))
      }
    },
  },
};



SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  /*if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }*/
});
