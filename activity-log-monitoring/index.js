const axios = require('axios');

module.exports = async function (context, eventHubMessages) {

    context.log("Event Hub Message Received");
    // Loop over every eventhub message we receive
    for (const event of eventHubMessages) {
        var eventHubParsed = JSON.parse(event);

        // Valid activity log messages contain an array of records. If that does not exist skip the message.
        if (!eventHubParsed.hasOwnProperty('records')) continue;


        // Loop over each record to forward to RunReveal
        for (const record of eventHubParsed.records) {
            if (!record.hasOwnProperty('category')) continue;
            context.log("Has Records & Category: Sending to RunReveal")

            var payload = {
                category: record.category,
                event: record
            };

            try {
                axios.post(process.env["RUNREVEAL_WEBHOOK"], payload);
            } catch (err) {
                context.log(`Error sending to RunReveal: ${err}`)
                throw err
            }
        }
    }
    context.done();
};

const checkConfig = function () {
    let runrevealWebhook = process.env["RUNREVEAL_WEBHOOK"];

    if (!runrevealWebhook) {
        return false;
    }

    return true;
}

exports.checkConfig = checkConfig;