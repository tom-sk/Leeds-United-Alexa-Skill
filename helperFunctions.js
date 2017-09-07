var helperFunctions = { 
    buildResponse: function(options) {
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
    },
    matchInformation: function (game) {
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
    
}

module.exports = helperFunctions;