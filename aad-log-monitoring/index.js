const axios = require('axios');

// Helper function to split an array into chunks
function chunkArray(array, chunkSize) {
    var index = 0;
    var arrayLength = array.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunkSize) {
        let chunk = array.slice(index, index + chunkSize);
        tempArray.push(chunk);
    }

    return tempArray;
}

module.exports = async function (context, eventHubMessages) {
    const eventPromises = [];
    const records = [];

    context.log(`(${context.invocationId}) Event Hub Message Received`);
    // Loop over every eventhub message we receive
    for (const event of eventHubMessages) {
        var eventHubParsed = JSON.parse(event);

        // Valid activity log messages contain an array of records. If that does not exist skip the message.
        if (!eventHubParsed.hasOwnProperty('records')) continue;


        // Loop over each record to forward to RunReveal
        for (const record of eventHubParsed.records) {
            // Set Parsed time field
            record.normalizedTime = new Date(record.time)
            records.push(record);
        }
    }

    // Split the records array into chunks of 500
    const recordChunks = chunkArray(records, 250);

    // Process each chunk separately
    for (const chunk of recordChunks) {
        try {
            eventPromises.push(axios.post(process.env["RUNREVEAL_AAD_WEBHOOK"], records));
        } catch (err) {
            context.log(`(${context.invocationId}) Error sending to RunReveal: ${err}`)
            throw err
        }
    }

    context.log(`(${context.invocationId}) Waiting on events to finish sending`)

    await Promise.allSettled(eventPromises).then(res => {
        if (res.every(x => x.status == "fulfilled")) { context.log(`(${context.invocationId}) All events received by RunReveal`) }
        else {
            res.filter(x => x.status == "rejected").forEach(x => {
                context.log(`Failed Message: ${eventHubMessages}`)
                context.log(`(${context.invocationId}) Sending to RunReveal Failed: ${x.reason}`);
            });
            throw new Error(`(${context.invocationId}) Error sending events to RunReveal`);
        }
    });
};