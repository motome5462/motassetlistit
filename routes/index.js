var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/assetlist', function(req, res, next) {
  res.render('assetlist', { title: 'assetlist' });
});

router.get('/Test', function(req, res, next) {
  res.render('Test', { title: 'Test' });
});






module.exports = router;
