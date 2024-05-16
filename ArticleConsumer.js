const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'article-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'article-group' });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'article-events', fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log('Received article event:', event);
        // Traitez l'événement d'article ici en fonction de l'événement reçu (création, modification, suppression, etc.)
        // Exemple : Appelez les fonctions appropriées pour gérer les événements d'article
        switch (event.eventType) {
          case 'creation':
            handleArticleCreation(event.articleData);
            break;
          case 'modification':
            handleArticleModification(event.articleData);
            break;
          case 'suppression':
            handleArticleSuppression(event.articleData);
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

const handleArticleCreation = (articleData) => {
  console.log('Handling article creation event:', articleData);
  // Logique pour gérer la création d'article ici
};

const handleArticleModification = (articleData) => {
  console.log('Handling article modification event:', articleData);
  // Logique pour gérer la modification d'article ici
};

const handleArticleSuppression = (articleData) => {
  console.log('Handling article suppression event:', articleData);
  // Logique pour gérer la suppression d'article ici
};

run().catch(console.error);
