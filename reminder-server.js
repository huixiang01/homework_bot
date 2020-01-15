const { google } = require('googleapis');
const axios = require('axios');

const calendarId = "// PUT CALENDER ID HERE";
const serviceAccount =
{
// PUT SERVICE ACCOUNT HERE
};

const serviceAccountAuth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
const timeZone = 'Asia/Singapore';

// replace the value below with the Telegram token you receive from @BotFather
const token = '    // PUT BOT TOKEN HERE';
const chat_Id = "    // PUT CHATID HERE"
var url = "https://api.telegram.org/bot"

exports.sendReminder = (req, res) => {
    var HomeworkTimeString = new Date(Date.now()).toLocaleString(
        'en-US',
        { month: 'long', day: 'numeric', timeZone: timeZone }
    );
    // cron.schedule("*/5 * * * *", function () {
    return (new Promise((resolve, reject) => {
        calendar.events.list({
            auth: serviceAccountAuth, // List events for time period
            calendarId: calendarId,
            timeMin: new Date(Date.now()).toISOString(),
            timeMax: new Date((new Date().setDate(new Date().getDate() + 1))).toISOString(),
        }, (err, calendarResponse) => {
            err ? reject(err) : resolve(calendarResponse.data.items)
        });
    }).then((results) => {
        console.log(results)
        if (results.length > 0) {
            homeworkstring = '';
            for (i = 0; i < results.length; i++) {
                if ('description' in results[i]) {
                    homeworkstring += (`${i + 1}. ${results[i].summary}: ${results[i].description} \n`);
                } else {
                    homeworkstring += (`${i + 1}. ${results[i].summary} \n`);
                }
            }
            var messagetext = `We have the following homeworks due today, ${HomeworkTimeString}`
            axios.post(`${url}${token}/sendMessage?chat_id=${chat_Id}&text=${messagetext}`)
                .then((response) => {
                    console.log(`statusCode: ${response.statusCode}`);
                }).catch((error) => {
                    console.error(error)
                })
            axios.post(`${url}${token}/sendMessage?chat_id=${chat_Id}&text=${homeworkstring}`)
                .then((response) => {
                    console.log(`statusCode: ${response.statusCode}`);
                }).catch((error) => {
                    console.error(error)
                })
        }

    })
    )
}
