const functions = require('firebase-functions');
const { google } = require('googleapis');
const { dialogflow } = require('actions-on-google');

// Enter your calendar ID below and service account JSON below
const calendarId = '<PUT YOUR CALENDAR ID HERE>';
const serviceAccount =
{
    // <PUT YOUR SERVICE ACCOUNT HERE>
}

// Starts with {"type": "service_account",...

// Set up Google Calendar Service account credentials
const serviceAccountAuth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
const app = dialogflow({ debug: true });
console.log(app)

const timeZone = 'Asia/Singapore';
const timeZoneOffset = '+08:00';

app.intent('homework-setup', (conv) => {
    console.log(conv)
    console.log(conv.parameters, "again");
    const Homework_type = conv.parameters.HomeworkType;
    const dateTimeStart = new Date(Date.parse(conv.parameters.date.split('T')[0] + 'T' + conv.parameters.time.split('T')[1].split('-')[0]));
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

    // Check the availibility of the time, and make an Homework if there is time on the calendar
    try {
        createCalendarEvent(dateTimeStart, dateTimeEnd, Homework_type);
        conv.ask(`Ok, ${Homework_type} Homework is set to be due on ${HomeworkTimeString}.`);
    }
    catch (e) {
        conv.ask(`Sorry I have encounter an error... You may want to set up the homework deadline at the following link`);
    }
})

app.intent('homework-check', (conv) => {
    const dateTimeStart = new Date(Date.parse(
        conv.parameters.date.split('T')[0] + 'T' + '00:00:00' + timeZoneOffset)
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
                conv.add(`We have the following homeworks due today, ${HomeworkTimeString}!`);
                for (i = 0; i < results.length; i++) {
                    if ('description' in results[i]) {
                        homeworkstring += (`${i + 1}. ${results[i].summary}: ${results[i].description} \n`);
                    } else {
                        homeworkstring += (`${i + 1}. ${results[i].summary} \n`);
                    }
                }
                conv.add(homeworkstring);
            } else {
                conv.add(`Today ${HomeworkTimeString}, there is no homework due! Hurray!`);
            }
        })
    );
})

app.intent('homework-reminder', (conv) => {

    const dateTimeStart = new Date(Date.now());
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
                conv.add(`We have the following homeworks due today, ${HomeworkTimeString}!`);
                for (i = 0; i < results.length; i++) {
                    if ('description' in results[i]) {
                        homeworkstring += (`${i + 1}. ${results[i].summary}: ${results[i].description} \n`);
                    } else {
                        homeworkstring += (`${i + 1}. ${results[i].summary} \n`);
                    }
                }
                conv.add(homeworkstring);
            } else {
                conv.add(`Today ${HomeworkTimeString}, there is no homework due! Hurray!`);
            }
        })
    );
})

exports.recieveRequest = functions.https.onRequest(app)
