import {Kafka, Consumer, EachMessagePayload} from "kafkajs";
import PipelineSTage from "./PipelineStage";
import { ConfigMessage, Config } from "@cdp-forge/types";
import custer_config from "config";

export default class ConfigListener {
    private kafka: Kafka;
    private consumer: Consumer;
    private stage: PipelineSTage;
    private config: Config;
    private consumerReadyP: Promise<void>;

    constructor(stage: PipelineSTage, config: Config) {
        this.config = config;
        this.kafka = new Kafka({
            clientId: config.plugin!.name + `plugin-${custer_config.get("pod.name")}`,
            brokers: config.kafkaConfig!.brokers,
          });
          this.consumer = this.kafka.consumer({ groupId: config.plugin!.name + `plugin-${custer_config.get("pod.name")}`});

        this.stage = stage;
        this.consumerReadyP = new Promise<void>((resolve) => {
            this.consumer.on("consumer.fetch_start", ()=> resolve());
        });
    }

    async start(): Promise<void> {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: this.config.manager!.config_topic, fromBeginning: false });
        await this.consumer.run({
            autoCommit: false,
            eachMessage: async ({ topic, partition, message  }: EachMessagePayload) => {
                const config: ConfigMessage = message.value ? JSON.parse(message.value.toString()) : null;

                if (config && config.plugin === this.config.plugin!.name) {
                    await this.stage.restart(config.inputTopic, config.outputTopic);
                }
                await this.consumer.commitOffsets([{ topic, partition, offset: (BigInt(message.offset) + 1n).toString() }]);
            }
        });
        await this.consumerReadyP;
    }
}