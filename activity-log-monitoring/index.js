const axios = require('axios');

module.exports = async function (context, eventHubMessages) {
    const eventPromises = [];
    context.log(`(${context.invocationId}) Event Hub Message Received`);
    // Loop over every eventhub message we receive
    for (const event of eventHubMessages) {
        var eventHubParsed = JSON.parse(event);

        // Valid activity log messages contain an array of records. If that does not exist skip the message.
        if (!eventHubParsed.hasOwnProperty('records')) continue;


        // Loop over each record to forward to RunReveal
        for (const record of eventHubParsed.records) {
            if (!record.hasOwnProperty('category')) continue;

            var payload = {
                category: record.category,
                event: record
            };

            try {
                eventPromises.push(axios.post(process.env["RUNREVEAL_WEBHOOK"], payload));
            } catch (err) {
                context.log(`(${context.invocationId}) Error sending to RunReveal: ${err}`)
                throw err
            }
        }
    }
    context.log(`(${context.invocationId}) Waiting on events to finish sending`)

    await Promise.allSettled(eventPromises).then(res => {
        if (res.every(x => x.status == "fulfilled")) { context.log(`(${context.invocationId}) All events received by RunReveal`) }
        else {
            res.filter(x => x.status == "rejected").forEach(x => {
                context.log(`(${context.invocationId}) Sending to RunReveal Failed: ${x.reason}`);
            });
            throw new Error(`(${context.invocationId}) Error sending events to RunReveal`);
        }
    });
};

const checkConfig = function () {
    let runrevealWebhook = process.env["RUNREVEAL_WEBHOOK"];

    if (!runrevealWebhook) {
        return false;
    }

    return true;
}

exports.checkConfig = checkConfig;