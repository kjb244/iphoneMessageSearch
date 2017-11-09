'use strict';

var express = require('express');
var router = express.Router();
var mainJCR = require('../jcrs/main.json');
var bcrypt = require('bcryptjs');
var path = require('path');
var helpers = require('../utilities/helpers.js');





router.get('/main', function(req, res, next) {
  res.render('index', mainJCR);
});


router.post('/textdata', function(req, res) {
	
    let username = req.body.username;
    let password = req.body.password;
    let searchText = req.body.searchText;
    let pagingNum = req.body.pagingNum || 1;
    
    if (helpers.checkLogin(username, password)){
    	console.log('before call');
    	let returnArr = helpers.getMatches(searchText, pagingNum);
    	returnArr.then(function(payload){
    	    payload.numResults = Math.ceil(payload.numResults/200);
    		res.send(payload);

    	});
   
    }
    else{
    	res.send([]);

    }

    
    

});

module.exports = router;
