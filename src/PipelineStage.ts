import Pulsar from 'pulsar-client';
import { PipelinePluginI } from "./plugin/PipelinePluginI";
import {Log, Config } from "@cdp-forge/types";

export default class PipelineSTage{
    plugin: PipelinePluginI;
    consumer: Pulsar.Consumer | null = null;
    producer: Pulsar.Producer | null = null;
    input: string | null;
    output: string | null;
    currentOperation: Promise<void>;
    private pulsar: Pulsar.Client;
    private config: Config;

    constructor(plugin: PipelinePluginI, config: Config) {
        this.plugin = plugin;
        this.pulsar = new Pulsar.Client({
          serviceUrl: config.pulsar!.proxy
        });
        this.config = config;
        this.input = null;
        this.output = null;
        this.currentOperation = Promise.resolve();
    }

    async start(inputTopic: string, outputTopic: string | null = null): Promise<void> {
        this.input = inputTopic;
        this.output = outputTopic;
        this.currentOperation = this.currentOperation.then(() => this.plugin.init());
        await this.currentOperation;
        this.currentOperation = this._start();
        return this.currentOperation;
    }

    private async _start(): Promise<void> {
        if(this.output) {
            this.producer = await this.pulsar.createProducer({
                topic: this.output,
                producerName: this.config.plugin!.name + "-" + this.config.pod.name
            });
        }

        this.consumer = await this.pulsar.subscribe({
            topic: this.input!,
            subscription:  this.config.plugin!.name,
            subscriptionType: 'Shared',
            listener: async (msg, msgConsumer) => {
                console.log(msg.getData().toString());
                const log: Log = JSON.parse(msg.getData().toString());
                if(!log) return;
                const elaboratedLog = await this.plugin.elaborate(log);
                if(!elaboratedLog) {
                    console.warn('Messaggio non elaborato');
                    await msgConsumer.acknowledge(msg);
                    return;
                }

                if(this.output && this.producer) {
                    await this.producer.send({
                        data: Buffer.from(JSON.stringify(elaboratedLog)),
                    });
                }
                await msgConsumer.acknowledge(msg);
            },
        });
    }

    async stop(): Promise<void> {
        await this.currentOperation;
        this.currentOperation = this._stop();
        return this.currentOperation;
    }

    private async _stop(): Promise<void> {
        await this.consumer?.close();
        await this.producer?.close();
        this.consumer = null;
        this.producer = null;
    }

    async restart(inputTopic: string,outputTopic: string|undefined): Promise<void> {
        if(this.input === inputTopic && this.output === outputTopic) return;
        await this.stop();
        await this.start(inputTopic,outputTopic);
    }

    public async close(){
        await this.stop();
        await this.pulsar.close();
    }
}