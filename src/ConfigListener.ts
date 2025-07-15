import Pulsar from 'pulsar-client';
import PipelineStage from "./PipelineStage";
import { ConfigMessage, Config } from "@cdp-forge/types";

export default class ConfigListener {
    private stage: PipelineStage;
    private config: Config;
    private pulsar: Pulsar.Client;
    private consumer: Pulsar.Consumer|null = null;

    constructor(stage: PipelineStage, config: Config) {
        this.pulsar = new Pulsar.Client({
            serviceUrl: config.pulsar.proxy
        });
        
        this.config = config;
        this.stage = stage;
    }

    async start(): Promise<void> {
        this.consumer = await this.pulsar.subscribe({
            topic: this.config.pipelinemanager!.config_topic,
            subscription:  this.config.plugin!.name + `plugin-${this.config.pod.name}`,
            subscriptionType: 'Exclusive',
            listener: async (msg, msgConsumer) => {
                console.log(msg.getData().toString());
                const cfgMessage: ConfigMessage = JSON.parse(msg.getData().toString());
                if (cfgMessage && cfgMessage.plugin === this.config.plugin!.name) {
                    await this.stage.restart(cfgMessage.inputTopic, cfgMessage.outputTopic);
                }
                await msgConsumer.acknowledge(msg);
            },
        });
    }

    async stop(){
        await this.consumer?.close();
        await this.pulsar.close();
    }
}