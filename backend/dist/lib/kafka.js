"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishEvent = exports.producer = void 0;
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'project-management-api',
    brokers: [process.env.KAFKA_BROKERS || ""],
});
exports.producer = kafka.producer();
const publishEvent = async (topic, message) => {
    try {
        await exports.producer.connect();
        console.log("Producer connected to Kafka");
        await exports.producer.send({
            topic,
            messages: [
                {
                    value: JSON.stringify(message),
                },
            ],
        });
        console.log(`Event published to ${topic}:`, message);
    }
    catch (error) {
        console.error('Error publishing event:', error);
    }
    finally {
        await exports.producer.disconnect();
    }
};
exports.publishEvent = publishEvent;
exports.default = kafka;
//# sourceMappingURL=kafka.js.map