import { Kafka, Producer, Consumer, EachMessagePayload } from "kafkajs";
import PipelineSTage from "./PipelineStage";
import Config from "./config";
import { ConfigMessage } from "./types";

const podName = process.env.CLIENT_ID || Math.random().toString(36).substring(2, 10);

export default class ConfigListener {
    private kafka: Kafka;
    private consumer: Consumer;
    private stage: PipelineSTage;

    constructor(stage: PipelineSTage) {
        this.kafka = new Kafka({
            clientId: Config.getInstance().config.plugin.name + `plugin-${podName}`,
            brokers: Config.getInstance().config.kafkaConfig.brokers,
          });
          this.consumer = this.kafka.consumer({ groupId: Config.getInstance().config.plugin.name + `plugin-${podName}`});
          
        this.stage = stage;
    }

    async start(): Promise<void> {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: Config.getInstance().config.kafkaConfig.config_topic, fromBeginning: false });
        await this.consumer.run({
            autoCommit: false,
            eachMessage: async ({ topic, partition, message  }: EachMessagePayload) => {
                const configs: ConfigMessage[] = message.value ? JSON.parse(message.value.toString()) : null;
                const config = configs.find(config => config.plugin === Config.getInstance().config.plugin.name);
                if(config) {
                    await this.stage.restart(config.inputTopic, config.outputTopic);
                }
                await this.consumer.commitOffsets([{ topic, partition, offset: (BigInt(message.offset) + 1n).toString() }]);
            }
        });
    }
}