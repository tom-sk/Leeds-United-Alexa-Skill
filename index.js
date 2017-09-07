'use strict';

var stateHandlers = require('./stateHandlers');
var helperFunctions = require('./helperFunctions.js');
exports.handler = function(event, context) {

    try {
        var request = event.request;
        var session = event.session;


        if(!event.session.attributes) {
            event.session.attributes = {};
        }


            if(request.type === "LaunchRequest"){
        
                stateHandlers.handleLaunchRequest(context);

            } else if(request.type === "IntentRequest") {
        
                if(request.intent.name === "ScoreIntent") {

                    stateHandlers.handleScoreIntent(request, context);

                } else if(request.intent.name === "TableIntent") {

                    stateHandlers.handleTableIntent(request, context);

                } else if (request.intent.name === "AllTableIntent"){

                    stateHandlers.handleAllTableIntent(request, context);

                } else if(request.intent.name === "NextMatchIntent") {

                    stateHandlers.handleNextMatchIntent(request, context);

                }else if(request.intent.name === "ManagerIntent"){

                    stateHandlers.handleManagerIntent(request, context);

                } else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
                    context.succeed(helperFunctions.buildResponse({
                        speechText: 'Good bye',
                        endSession: true
                    }))
                } else if (request.intent.name === "AMAZON.HelpIntent"){
                    context.succeed(helperFunctions.buildResponse({
                        speechText: "You can say what is the latest score, where are leeds in the table, and when are leeds playing next.",
                        endSession: false
                    }))
                } else {
                    throw "Unknown Intent type";
                }
        
            } else if(request.type === "SessionEndedRequest") {
            } else {
                throw "Unknown Intent type";
            }
    } catch(e){
        context.fail("Exception: " + e)
    }
    
}

