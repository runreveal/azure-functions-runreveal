module.exports = async function (context, eventHubMessages) {

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

            axios.post(process.env["RUNREVEAL_WEBHOOK"], payload);
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