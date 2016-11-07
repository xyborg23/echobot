var restify = require('restify');
// var builder = require('botbuilder');

var builder = require('../../core/');

// Create chat bot
var connector = new builder.ChatConnector({
    appId: proccess.env.BOTFRAMEWORK_APPID,
    appPassword: proccess.env.BOTFRAMEWORK_APPSECRET
});

var bot = new builder.UniversalBot(connector);
bot.dialog('/', function (session) {
    
    //respond with user's message
    session.send("You said");
});

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
// server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
