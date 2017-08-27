

var fs = require('fs'),
base64Img = require('base64-img');

var User = require('../models/users.js');
var Wall = require('../models/walls.js');




module.exports = function(app) {

	// have the base (default) route redirect to the /wall route
	app.get("/", function(req, res) {
	    res.redirect("/wall");
	});


	app.get("/wall", function(req, res) {

		    var user = req.user || null;

		    Wall.find(function(err, canvas){
		    	if(!canvas.length){
					res.render("index", { user: user, anchors: {}, info: req.flash('info') });
		    	}else{
		    		res.render("index", { user: user, anchors: canvas[0].elements, info: req.flash('info') });
		    	}
		    });

	});


	app.get("/updatedelements", function(req, res) {

		    var imgs = [];


		    res.send(imgs);


	});


	app.get("/code/:token", function(req, res) {

		User.findById(req.params.token, function(err, user) {

			var infoMsg;
			// If user has already been confirmed there is no point in saving again
			// if user associated with unique secret token clicks the link again 
			// after already doing so and being confirmed
			if(user && !user.confirmed){
				user.confirmed = true;
				user.save();

				infoMsg = "Congratulations. Your account was verified. You may sign in.";
			} else if(user){
				infoMsg = "That account has already been verified.";
			} else {
				infoMsg = "That link is not for a valid account.";
			}

			req.flash("info", infoMsg);

		  	res.redirect('/wall')
		}); 

	});


	app.post("/uploadlinks", function(req, res) {

		if(req.isAuthenticated()){
			Wall.find(function(err, canvas){

				if(!canvas.length){
					canvas = new Wall();
					canvas.elements.push({
						content: req.body['data[0][content]'],
						top: req.body['data[0][top]'],
						left: req.body['data[0][left]'],
						color: req.body['data[0][color]']
					});

				} else {
					canvas[0].elements.push({
						content: req.body['data[0][content]'],
						top: req.body['data[0][top]'],
						left: req.body['data[0][left]'],
						color: req.body['data[0][color]']
					});

				}


				canvas[0].save(function(){
					return res.send("success");
				});

				
			})

	 	}


	});


};


