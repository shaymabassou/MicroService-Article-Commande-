const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'commande-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'commande-group' });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'commande-events', fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log('Received commande event:', event);
        switch (event.eventType) {
          case 'creation':
            handleCommandeCreation(event.commandeData);
            break;
          case 'modification':
            handleCommandeModification(event.commandeData);
            break;
          case 'suppression':
            handleCommandeSuppression(event.commandeData);
            break;
          default:
            console.warn('Event type not recognized:', event.eventType);
        }
      },
    });
  } catch (error) {
    console.error('Error with Kafka consumer:', error);
  }
};

const handleCommandeCreation = (commandeData) => {
  console.log('Handling commande creation event:', commandeData);
};

const handleCommandeModification = (commandeData) => {
  console.log('Handling commande modification event:', commandeData);
};

const handleCommandeSuppression = (commandeData) => {
  console.log('Handling commande suppression event:', commandeData);
};

run().catch(console.error);
