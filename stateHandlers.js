'use strict';

var request = require('request');
var moment = require('moment');
var stateHandlers = {
   handleScoreIntent: function(request, context) {
        let options = {};
        options.speechText = ``;

        getScore(function (score, err){
            if(err){
                context.fail(err);
            } else {
                options.speechText += score.teamName + ' ' + score.result + ' in there match against ' + score.opponentName + '. ';
                options.speechText += 'The score was, ' + score.teamName + ' <say-as interpret-as="cardinal">' + score.teamGoals + '</say-as>, ' + score.opponentName + ' <say-as interpret-as="cardinal">' + score.opponentGoals + '</say-as>';
    
                options.endSession = true;
                context.succeed(buildResponse(options));
            }

        });
    },
    handleTableIntent: function(request, context) {
        let options = {};
        options.speechText = ``;
   
        getTablePosition(function (table, err){
            if(err){
                context.fail(err);
            } else {
                options.speechText += table.teamName + ' are currently <say-as interpret-as="ordinal">' + table.position + '</say-as> in the league ';
                options.speechText += 'with ' + table.points + ' points, ' + table.goals + ' goals, ' + table.wins + ' wins, ' + table.draws + ' draws '
                                       + 'and ' + table.losses + ' losses';
                options.endSession = true;
                context.succeed(buildResponse(options));
            }
        });
    },
    handleAllTableIntent: function(request, context) {
        let options = {};
        options.speechText = ``;
        let utterence = request.intent.slots.Position.value;



        let position = request.intent.slots.Position.value.match(/[0-9]+/g);

        if(utterence == 'top'){
            position = 1;
        } else if(utterence == 'bottom'){
            position = 24;
        }

        getAllTablePosition(position, function (table, err){
            if(err){
                context.fail(err);
            } else {
                options.speechText += `${table[0].teamName} are <say-as interpret-as="ordinal">${position}</say-as> in the Championship`;
                options.endSession = true;
                context.succeed(buildResponse(options));
            }
        });
    },
    handleNextMatchIntent: function(request, context) {
        let options = {};
        options.speechText = ``;

        getNextMatch(function(nextMatch, err) {
            if(err){
                context.fail(err);
            } else {
                options.speechText += 'Leeds will play ' + nextMatch.opponentName + ' ' + nextMatch.homeAway + ' on ' + nextMatch.date + ' at ' + nextMatch.time.hour + ' ' + nextMatch.time.min;
                options.endSession = true;
                context.succeed(buildResponse(options));
            }
        });
    },
    handleLaunchRequest: function(context) {
        let options = {}
        
        options.speechText = "Welcome to Leeds United Skill. Use this skill to keep up to date on Leeds United.";
        options.repromptText = "You can say what is the latest score, where are leeds in the table, and when are leeds playing next.";
        options.endSession = false;

        context.succeed(buildResponse(options));
    }
}
//Should probally be in env file
var API_KEY = '3f3fd8da342c439eb501d0e00568c104'; 

function getScore(callback){

    var options = {
        url: 'http://api.football-data.org/v1/teams/341/fixtures',
        headers: { 'X-Auth-Token': API_KEY }
    };

    function scoreCallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);

            let games = result.fixtures.filter(function(game){
                return moment(game.date) < moment();
            })

            // console.log(JSON.stringify(games[0], null, 3));
            callback(matchInformation(games[0]))

        }
    }
    
    request(options, scoreCallback);
}


function getTablePosition(callback){
    
    var options = {
        url: 'http://api.football-data.org/v1/competitions/446/leagueTable',
        headers: { 'X-Auth-Token': API_KEY }
    };
    
    function scoreCallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);

    
            // console.log(JSON.stringify(result.standing, null, 3));
            result = result.standing.filter((team) => {
                return team.teamName == 'Leeds United';
            })
            
            // console.log(result[0])
            callback(result[0])
    
        }
    }
    
    request(options, scoreCallback);
}
    

function getAllTablePosition(position, callback){
    
    var options = {
        url: 'http://api.football-data.org/v1/competitions/446/leagueTable',
        headers: { 'X-Auth-Token': API_KEY }
    };
    function scoreCallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);

    
            // console.log(JSON.stringify(result.standing, null, 3));
            result = result.standing.filter((team) => {
                return team.position == position;
            })
            
            // console.log(JSON.stringify(result[0].teamName, null, 3))
            callback(result)
    
        }
    }
    
    request(options, scoreCallback);
}
    
function getNextMatch(callback){
    
    var options = {
        url: 'http://api.football-data.org/v1/teams/341/fixtures',
        headers: {
            'X-Auth-Token': API_KEY
        }
    };

    function scoreCallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);

            let matches = result.fixtures.filter((match) => {
                return match.status == 'TIMED';
            });
            // console.log(JSON.stringify(matches[0], null, 3));
    
            callback(matchInformation(matches[0]));
    
        }
    }
    
    request(options, scoreCallback);
}

function matchInformation(game) {
    var score = {
        teamName: '',
        teamGoals: '',
        opponentName: '',
        opponentGoals: '',
        result: '',
        homeAway:'',
        date: '',
        time: {
            hour: '',
            min: ''
        }
    }

    if(game.homeTeamName == 'Leeds United'){
        score.teamName = game.homeTeamName;
        score.teamGoals = game.result.goalsHomeTeam;
        score.opponentGoals = game.result.goalsAwayTeam;
        score.opponentName = game.awayTeamName;
        score.homeAway = 'at home';
    } else{
        score.teamName = game.awayTeamName;
        score.teamGoals = game.result.goalsAwayTeam;
        score.opponentGoals = game.result.goalsHomeTeam;
        score.opponentName = game.homeTeamName;
        score.homeAway = 'away';
    }

    if( score.teamGoals > score.opponentGoals ) {
        score.result = 'won';
    } else if (score.teamGoals < score.opponentGoals) {
        score.result = 'lost';
    } else {
        score.result = 'drew';
    }

    score.date = moment(game.date).format("dddd, MMMM Do");
    score.time.hour = moment(game.date).format("h");
    let mins = moment(game.date).format("mm");
    score.time.min = mins !== '00' ? mins : '';

    return score;
}

function buildResponse(options) {
    var response = {
        version: "1.0",
        response: {
            outputSpeech: {
            type: "SSML",
            ssml: "<speak>" + options.speechText + "</speak>" 
            },
            shouldEndSession: options.endSession
        }
    };

    if(options.repromptText){
        response.response.repromptText = {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>" + options.repromptText + "</speak>" 
            }
        }
    };

    if(options.session && options.session.attributes) {
        response.sessionAttributes = options.session.attributes;
    }

    if(options.cardTitle) {
        response.response.card = {
            type: "Simple",
            title: options.cardTitle,
            content: "Welcome to Leeds Football Skill"
        }
    }

    if(options.imageUrl){
        response.response.card.type = "Standard";
        response.response.card.text = options.cardContent;
        response.response.card.image = {
            smallImageUrl: options.imageUrl,
            largeImageUrl: options.imageUrl
        };
    } else {
        
        // response.response.card.content = options.cardContent;
    }

    return response;
}


module.exports = stateHandlers;