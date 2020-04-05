const { google } = require('googleapis');
const axios = require('axios');

const calendarId = 'qep0nd16l21ldatee1pc2cmg6g@group.calendar.google.com';
const serviceAccount =
{
    "type": "service_account",
    "project_id": "hwbot-264112",
    "private_key_id": "0729e286212eb8f63088bc78b807c913d47f1cb1",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCp7u2tvjyriHL1\nbgPwTgVYQblfNEVMu1pCA9WlCkL4I7NXd8mO73Topw9wJWTfWHFtIZhwiF9XDxcr\nkjRZDGAlTFKI2rEcEinR7j9IfeBhMIeHyOoy/W3KytzI1ubkv0P0KEiQLqi2ir5Q\nfZ7EP25QGOtUXOp7PnHVx5nxd5QvPFuXYHmRoIvLpLpAiY0vwNxrYlFlgjToRGm5\nIR6+SSzwNz+kkL4u0inTTwqGWP74KV8iQALVaTDsftTcWym7qVvf+WC2OihwyhBx\nR0/3X++PHM+rT62/I/91qMCB7UgnaJYc7dct89WIbOZB7OQ1tos978fhhrhTn4Gw\nW9rFfRrJAgMBAAECggEAUGyANziwDPyUb5xkJ9A9DlJ4sVqTK6gFpPWcoLHVFQwM\nXiqWjVu9yDf8gfZooZ2BfQUn2KZp/NFrBVd6B+ToAe73psZdiOv9t9maQKw2S7kE\ng5puYLh5RD8zM6gleYAd4IlKIla6yT2rqXtybu2YPzcz9ObOoIpipKsFK/cMfje8\nsnneV5ocDsyPRpZScOhpRv6/dTkcukqszbbPbpoROaxRiPPVLu6PR8o4dkRoyMVg\nLS00z86Ju1NqwXXlOLGdUQcZ8P5sAZDcYfZrbLd7ZKvARhpAz+Fl+v+5d9+47+fj\nPIKCIDPeVLX4Jw32AlgKuhYYcIt3uHj3at2wcOgDYwKBgQDQznQW4AlblVp6W6N2\n97XItN6PDpz5eCPz0KJmAmfSmAVS7xrJLDszhZswADsdm9AWP06Fn8SeNkFpgCTK\nGzFNXHWIt7Md7ZnrM+XutqtfiTvpiskq5U0xSBdN5rHj/lKTrxN93t1cfiYiniAd\n3v+/DZEohxfx+MSYDje3BMFm0wKBgQDQV0Ye9c/LeP7IEfvQeTcplw9KvnUyfvWe\nfg4CHjbrjsBdYr5aYBoOvFKHQs4SLgHYgygDUKmZaS2kTaS3IrnDmzp+XNsQPZge\nDWH+566XFB54xn6Bes8HBqidsq7oNb2EPmNe/nUs13KlX5lQBiIOv+cFvjZNDzeJ\nRvp+RBYucwKBgAsFSoVGj9fgmyToH0mRK2wLd8+vIsPb/nHI6jleGSK5WVaWPiCu\nD/XZMGapLHWUmrgB4WAWHaeID43E8KwmIUUHA0ETCQYkW0JZu+IMjCD/ukTKSXHV\nJmzadDhtW6g/7RXUYL/8+kv+cH7VP7az5WWtDqNH9hCUY7Pu1Cv5uUd3AoGAf2Qu\nCzZQ9eCpIZrld+b2lOa6QgDNVrAM7fm0BRWGjWh/NVrwfABxTntWl0CBEtqw5Dvm\nVoiW+6g1cVbMlfKU1gdvr96FUJvpDM8wEZaGyfhSXZU5u2BlgK1QowSkMHbTyC4B\nww8ihOXEQ1x+OVFWt+AdmgRh3aKlWbpd5qEpUwMCgYAhpkcHHtbB0FYXQLV+hrd6\nF4fA0gNf3rjGj9aKUpnHY+U11qGjgOLNrWjA9wYKEp2l1ieSzeTakM8Whnhf9ZpU\nW8fhU6XEL9NtmcUNTuhCabsuiJyhRmPK5RXL6x8tR7bfNIlHKGwjHkrDmlO9wBcJ\ntgVjsi1+tS3eMadosPCzhQ==\n-----END PRIVATE KEY-----\n",
    "client_email": "homeworkbot@hwbot-264112.iam.gserviceaccount.com",
    "client_id": "115252961293969838347",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/homeworkbot%40hwbot-264112.iam.gserviceaccount.com"
};

const serviceAccountAuth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
const timeZone = 'Asia/Singapore';

// replace the value below with the Telegram token you receive from @BotFather
const token = '1026518117:AAE6ues_OSg8Yqucd5pJZdahhnctVwFjZ2I';
const chat_Id = '-1001429933617'
var url = "https://api.telegram.org/bot"

exports.sendReminder = (req, res) => {
    var HomeworkTimeString = new Date(new Date((new Date().setDate(new Date().getDate() + 1)))).toLocaleString(
        'en-US',
        { month: 'long', day: 'numeric', timeZone: timeZone }
    );
    end = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2, 0, 0)
    start = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 0, 0)
    // cron.schedule("*/5 * * * *", function () {
    return (new Promise((resolve, reject) => {
        calendar.events.list({
            auth: serviceAccountAuth, // List events for time period
            calendarId: calendarId,
            timeMin: start,
            timeMax: end,
        }, (err, calendarResponse) => {
            err ? reject(err) : resolve(calendarResponse.data.items)
        });
    }).then((results) => {
        console.log(results)
        if (results.length > 0) {
            homeworkstring = '';
            for (i = 0; i < results.length; i++) {
              	if ('description' in results[i]) {
                    console.log(results[i].summary, results[i].description)
                  	homeworkstring += (`${i + 1}. ${results[i].summary}: ${results[i].description} \n`);
                } else {
                  	console.log(results[i].summary)
                    homeworkstring += (`${i + 1}. ${results[i].summary} \n`);
                }
            }
            var messagetext = `We have the following homeworks due tommorrow, ${HomeworkTimeString}`
            console.log(messagetext, homeworkstring)
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
        } else {
            var messagetext = `Tommorrow ${HomeworkTimeString}, there is no homework due! Hurray!`
            axios.post(`${url}${token}/sendMessage?chat_id=${chat_Id}&text=${messagetext}`)
                .then((response) => {
                    console.log(`statusCode: ${response.statusCode}`);
                }).catch((error) => {
                    console.error(error)
                })
        }

    })
    )
}
