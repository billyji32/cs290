
/*Set basic requires*/
var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('express-session');
var bodyParser = require('body-parser');
var request=require('request');
app.use(bodyParser.urlencoded({ extended: false }));

/*Start an express session*/
app.use(session({secret:'SuperSecretPassword'}));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

app.get('/',function(req,res,next){
  var context = {};

  /*If there is no session, go to the main page.*/
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }

  /*Otherwise update context object with current session details*/
  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length || 0;
  context.toDo = req.session.toDo || [];
  console.log(context.toDo);

  /*Render the main site with the new user-provided details*/
  res.render('toDo',context);
});

app.post('/',function(req,res){
  var context = {};

  /*apikey for openweathermap.org*/
  var apiKey="7c6f876fcdc193215520add15743df57"; /*note: should be private/hidden*/
  
  /*If user clicks on the New List button*/
  if(req.body['New List']){
  	/*Update session information with user provided information, create a new list*/
    req.session.name = req.body.name;
    req.session.toDo = [];
    req.session.curId = 0;  

    /*Update context object with session details*/
  	context.name = req.session.name;
  	context.toDoCount = req.session.toDo.length;
  	context.toDo = req.session.toDo;

  	/*Render site with these new user-provided details*/
  	res.render('toDo',context);
  }

  /*If there is no session for some strange reason, go to the main page.*/
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }

  /*If user clicks on the Add Item button(wants to add a new task)*/
  if(req.body['Add Item']){  
	
  	/*Get user input of city and gets rid of any spaces*/
	var cityName=req.body.city.replace(/\s+/g, '');

	/*Opens a request the receive the current weather at the user-provided city from openweathermap.org*/
request('http://api.openweathermap.org/data/2.5/weather?q=' + cityName+ "&APPID="+apiKey, function(err, response, body){

	/*If no error*/
	if(!err && response.statusCode < 400){

		/*Parse the response to a usable string*/
		var body2=JSON.parse(body);

		/*Access the "temp" value and change it from kelvin to celcuis*/
		var temp=Math.round(body2.main["temp"])-273;

		/*If the current temperature is less than the user-specified minnimum weather for the task*/
	if(temp<req.body.minW)	
		/*Set color property to red*/
		req.session.toDo.push({"name":req.body.name,"currentTemp":temp,"color":"red","city":req.body.city,"minimum":req.body.minW, "id":req.session.curId});
	else
		/*Else weather is good, set color property to green*/
req.session.toDo.push({"name":req.body.name,"currentTemp":temp,"color":"green","city":req.body.city,"minimum":req.body.minW, "id":req.session.curId});

/*Increase the session's curId, which allows us to give each task a unique ID*/
req.session.curId++;

/*Update context object with current session details*/
  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length;
  context.toDo = req.session.toDo;

/*Render the page*/
  res.render('toDo',context);
	return;
}


/*Else if there was an error, log it to the page*/
	else{
		console.log(err);
		if(response){
			console.log(response.statusCode);
		}
		next(err);
	}});
 
  }
  /*End of 'Add Item'*/


/*If user clicks on the Done button(wants to remove a task from the last list*/
  if(req.body['Done']){
  	/*This filters out the task with the id that matches the id of the task
  	that the user wants to remove*/ 
    req.session.toDo = req.session.toDo.filter(function(e){
      return e.id != req.body.id;
    })

/*Update context with session details, render the page*/
  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length;
  context.toDo = req.session.toDo;

  res.render('toDo',context);
  }
});

/*Error page for 404*/
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

/*Error page for 500*/
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

/*Access port*/
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
