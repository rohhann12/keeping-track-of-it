import { Kafka } from 'kafkajs';
declare const kafka: Kafka;
export declare const producer: import("kafkajs").Producer;
export declare const publishEvent: (topic: string, message: any) => Promise<void>;
export default kafka;
//# sourceMappingURL=kafka.d.ts.map