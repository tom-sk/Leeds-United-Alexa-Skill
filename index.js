'use strict';

var stateHandlers = require('./stateHandlers');

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

                } else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
                    context.succeed(buildResponse({
                        speechText: 'Good bye',
                        endSession: true
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








