var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');
var xml2js = require('xml2js');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

var questions = ['What is force?', 'What is insulin?', 'What is the slope of a line?']
var answers = ['Force is mass times acceleration. It is the strength of physical action.', 'Insulin is a hormone that is important to maintain glucose levels in blood.', 'It is the rate of change of a line.']
var current_question = ""

var botReplies = [
    { field: 'RN', prompt: "Great! Can you elaborate?" },
    { field: 'RO', prompt: "That is correct, but tell me something more." },
    { field: 'IN', prompt: "That does not seem relevant here. Try again." },
    { field: 'IO', prompt: "Try thinking of your answer in another way." }
];


var remoteSessionKey = "";
var JSONObject = {};
JSONObject.ttop = 50;
JSONObject.category = "news";
JSONObject.include_etop = true;
var answerKey = "Force is mass times acceleration. It is the strength of physical action.";
JSONObject.target = encodeURI(answerKey);
JSONObject.SS = "tasalsa500";
JSONObject.wc = 0;
JSONObject.notes = "";
JSONObject.sessionKey = "";
JSONObject.format = "xml";
JSONObject.minWeight = 0;
JSONObject.userGuid = "44064767-a6ef-4c70-9536-cf196ee6794a";
JSONObject.type = "2";
JSONObject.text = "";
JSONObject.minStrength = 0;
JSONObject.current = "";
JSONObject.guid = "ea8308d1-f93c-457d-84c8-1fa4457c7148";
JSONObject.include_ttop = true;
JSONObject.minRankby = 0;
JSONObject.etop = 10;
JSONObject.domain = "nodomain";
var jsonString = JSON.stringify(JSONObject);
var pathpath = '/lcc?json=' + jsonString;

var cc = "";
var ct = 0;
var r_old = "";
var r_new = "";
var irr_old = "";
var irr_new =  "";

var pathqa = 'books/books2';

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        session.send("Hello, I am EMT Bot!");
        session.beginDialog('/menu');
    },
    function (session, results) {
        session.endConversation("Goodbye until next time...");
    }
]);

bot.dialog('/menu', [
    function (session) {
        builder.Prompts.choice(session, "Choose a subject:", 'Physics|Biology|Math|Quit');
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:
            case 1:
            case 2:
                ct = "";
                session.beginDialog('/askQuestions', results.response);
                break;
            default:
                session.endDialog();
                break;
        }
    },
    function (session) {
        // Reload menu
        session.replaceDialog('/menu');
    }
]).reloadAction('showMenu', null, { matches: /^(menu|back)/i });

bot.dialog('/askQuestions', [
    function (session, args) {
        ct = "";
        // HERE IS THE GOOGLE DATASTORE QUERY ======
        if(args.entity != null) {
            current_question = questions[args.index];
            answerKey = answers[args.index];
        }
        // Save previous state (create on first call)
        session.dialogData.answer = args ? args.answer : "";

        // Prompt user for next field
        console.log(current_question);
        builder.Prompts.text(session, current_question);
    },
    function (session, results) {
        // Save users reply
        session.dialogData.answer = results.response;
        if (session.dialogData.answer.indexOf('exit') >= 0 || session.dialogData.answer.indexOf('quit') >= 0) {
            session.replaceDialog('/menu');
            return;
        }
        // Check for end of form
        if (ct < 0.6) {
            // session.send("You said " + session.dialogData.answer);
            answerInput = encodeURI(session.dialogData.answer);
            JSONObject.current = answerInput;
            JSONObject.target = encodeURI(answerKey);
            var jsonString = JSON.stringify(JSONObject);
            var pathpath = '/lcc?json=' + jsonString;
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(jsonString);
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            var options = {
              host: 'dsspp.skoonline.org',
              path: pathpath
            };

            callback = function(response) {
              var str = '';

              //another chunk of data has been recieved, so append it to `str`
              response.on('data', function (chunk) {
                str += chunk;
              });

              //the whole response has been recieved, so we just print it out here
              response.on('end', function () {
                  var parseString = xml2js.parseString;
                  parseString(str, function(err, results) {
                      cc = results['lcc']['CC'];
                      ct = results['lcc']['CT'];
                      r_old = results['lcc']['RO'];
                      r_new = results['lcc']['RN'];
                      irr_old = results['lcc']['IO'];
                      irr_new = results['lcc']['IN'];
                      remoteSessionKey = results['lcc']['sessionKey'];
                      JSONObject.sessionKey = encodeURI(remoteSessionKey);
                      console.dir(results);
                      console.log("CC ============= " + cc);
                      console.log("CT ============= " + ct);
                      session.send("CT ============= " + ct);
                      console.log("RO ============= " + r_old);
                      console.log("RN ============= " + r_new);
                      console.log("IO ============= " + irr_old);
                      console.log("IN ============= " + irr_new);
                  });
                  console.log(str);
                  if(ct > 0.6) {
                      session.send("Great! You got it! Want to try some other subject?")
                      // Resetting all the variables to not make the mistake
                      cc = "";
                      ct = "";
                      r_old = "";
                      r_new = "";
                      irr_old = "";
                      irr_new =  "";
                      JSONObject.sessionKey = "";
                      session.endDialogWithResult({ response: session.dialogData.answer });
                  }
                  else {
                      if(cc >= 0 && cc < 0.1) {
                          session.send("I know you can do this. Try to recall what we learned.");
                      }
                      else if(cc >= 0.1 && cc < 0.2) {
                           session.send("Maybe. Try expanding on your answer.");
                      }
                      else if(cc >= 0.2 && cc < 0.3) {
                           session.send("You're on the right track! Please try to elaborate.");
                      }
                      else if(cc >= 0.3 && cc < 0.5) {
                           session.send("Great! Can you try to expand on your answer a little bit more?");
                      }
                      else if(cc >= 0.5 && cc < 0.6) {
                           session.send("You're on the right track. Be sure to answer both parts of the question.");
                      }
                      else {
                           session.send("Perfect");
                      }
                      session.replaceDialog('/askQuestions', session.dialogData);
                  }
              });
            }

            val = http.request(options, callback).end();
            if(val != "") {
                console.log("VAL IS:" + val);
            }
        } else {
            // Return completed form
            console.log("CT: " + ct);
            console.log("END DIALOG");
            session.endDialogWithResult({ response: session.dialogData.answer });
        }
    }
]);
