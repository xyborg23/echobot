var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.BOTFRAMEWORK_APPID,
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
});

// Create bot
var bot = new builder.UniversalBot(connector);
// Handle Bot Framework messages
// server.post('/api/messages', connector.listen());
bot.dialog('/', function (session) {
    
    //respond with user's message
    session.send("You said ");
});

//server.post('/api/messages', bot.verifyBotFramework(), bot.listen());


