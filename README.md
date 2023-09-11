# Azure Functions for Sending Event Hub data to RunReveal

This collection of functions are triggered when events arrive on an Azure Event Hub namespace. Azure Functions can process events in near real time and will forward the data to RunReveal. 


[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Frunreveal%2Fazure-functions-runreveal%2Fmain%2Fdeploy%2FazureDeploy.json)

## Getting Started

### 1. Create an Azure source in your RunReveal account.

Find the appropriate Azure source and create a new one giving it a name. You will be provided with a URL that will be used to forward your events.

### 2. Create Event Hub

These functions are triggered from Event Hub data. Create an Event Hub namespace following the [instructions provided by Microsoft](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-create).

### 3. Sending data to Event Hub

Following the [documentation in RunReveal](https://docs.runreveal.com/getting-started/integrations/log-sources/azure) setup the event source to forward data to an Event Hub namespace. Make note of the hub name, consumer group, and connection string.

### 4. Deploy Functions

Use the 'Deploy to Azure' button about to create the necessary Azure Functions. You will be asked for the Event Hub setup information that was obtained in step 3, and you will need to provide the RunReveal webhook URL obtained in step 1. Once deployed Azure will create the necessary resources to maintain this function. The Azure Functions should start executing as soon as events arrive into the Event Hub namespace.