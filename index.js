const functions = require('firebase-functions');
const { google } = require('googleapis');
const { WebhookClient } = require('dialogflow-fulfillment');

// Enter your calendar ID below and service account JSON below
const calendarId = "// PUT CALENDER ID HERE";
const serviceAccount =
{
    // PUT SERVICE ACCOUNT HERE
}

// Starts with {"type": "service_account",...

// Set up Google Calendar Service account credentials
const serviceAccountAuth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
process.env.DEBUG = 'dialogflow:*'; // enables lib debugging statements

const timeZone = 'Asia/Singapore';
const timeZoneOffset = '+08:00';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log("Parameters", agent.parameters);


    function makeHomework(agent) {
        const Homework_type = agent.parameters.HomeworkType;
        const dateTimeStart = new Date(Date.parse(agent.parameters.date.split('T')[0] + 'T' + agent.parameters.time.split('T')[1].split('-')[0]));
        const dateTimeEnd = new Date(new Date(dateTimeStart).setHours(dateTimeStart.getHours() + 1));
        const HomeworkTimeString = dateTimeStart.toLocaleString(
            'en-US',
            { month: 'long', day: 'numeric', hour: 'numeric', timeZone: timeZone }
        );
        console.log(HomeworkTimeString);

        function createCalendarEvent(dateTimeStart, dateTimeEnd, Homework_type) {
            return new Promise((resolve, reject) => {
                calendar.events.insert({
                    auth: serviceAccountAuth,
                    calendarId: calendarId,
                    resource: {
                        summary: Homework_type + ' Homework', description: Homework_type + ' due on ' + HomeworkTimeString,
                        start: { dateTime: dateTimeStart },
                        end: { dateTime: dateTimeEnd }
                    }
                }, (err, event) => {
                    err ? reject(err) : resolve(event);
                });

            });
        }

        try {
            createCalendarEvent(dateTimeStart, dateTimeEnd, Homework_type);
            agent.add(`Ok, ${Homework_type} Homework is set to be due on ${HomeworkTimeString}.`);
        }
        catch (e) {
            agent.add(`Sorry I have encounter an error... You may want to set up the homework deadline at the following link`);
        }
    };

    function checkHomework(agent) {
        const dateTimeStart = new Date(Date.parse(
            agent.parameters.date.split('T')[0] + 'T' + '00:00:00' + timeZoneOffset)
        );
        const dateTimeEnd = new Date(new Date(dateTimeStart).setDate(dateTimeStart.getDate() + 1));
        const HomeworkTimeString = dateTimeStart.toLocaleString(
            'en-US',
            { month: 'long', day: 'numeric', timeZone: timeZone }
        );

        function checkCalendarEvent(dateTimeStart, dateTimeEnd) {
            return new Promise((resolve, reject) => {
                calendar.events.list({
                    auth: serviceAccountAuth, // List events for time period
                    calendarId: calendarId,
                    timeMin: dateTimeStart.toISOString(),
                    timeMax: dateTimeEnd.toISOString()
                }, (err, calendarResponse) => {
                    err ? reject(err) : resolve(calendarResponse.data.items);
                });
            });
        }

        return (checkCalendarEvent(dateTimeStart, dateTimeEnd)
            .then((results) => {
                if (results.length > 0) {
                    homeworkstring = '';
                    agent.add(`We have the following homeworks due today, ${HomeworkTimeString}!`);
                    for (i = 0; i < results.length; i++) {
                        if ('description' in results[i]) {
                            homeworkstring += (`${i + 1}. ${results[i].summary}: ${results[i].description} \n`);
                        } else {
                            homeworkstring += (`${i + 1}. ${results[i].summary} \n`);
                        }
                    }
                    agent.add(homeworkstring);
                } else {
                    agent.add(`On ${HomeworkTimeString}, there is no homework due! Hurray!`);
                }
            })
        );
    }
    let intentMap = new Map();
    intentMap.set('homework-setup', makeHomework);
    intentMap.set('homework-check', checkHomework);
    agent.handleRequest(intentMap);
});
