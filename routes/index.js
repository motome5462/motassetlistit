var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/assetlist', function(req, res, next) {
  res.render('assetlist', { title: 'assetlist' });
});

router.get('/Report', function(req, res, next) {
  res.render('Report', { title: 'Report' });
});

router.get('/pr', function(req, res, next) {
  res.redirect('/pr/new');
});

router.get('/pr/detail', function(req, res, next) {

  res.redirect('/pr/list');
});

router.get('/po', function(req, res, next) {
  res.redirect('/po/new');
});


router.get('/po/detail', function(req, res, next) {

  res.redirect('/po/list');
});






module.exports = router;
