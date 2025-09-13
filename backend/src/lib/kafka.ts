import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'project-management-api',
  brokers: [process.env.KAFKA_BROKERS||""],
});

export const producer = kafka.producer();

export const publishEvent = async (topic: string, message: any) => {
  try {
    await producer.connect();
    console.log("Producer connected to Kafka");
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
    console.log(`Event published to ${topic}:`, message);
  } catch (error) {
    console.error('Error publishing event:', error);
  } finally {
    await producer.disconnect();
  }
};

export default kafka;
