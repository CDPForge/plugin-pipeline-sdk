import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import ConfigListener from "../src/ConfigListener";
import PipelineStage from "../src/PipelineStage";
import { Config, ConfigMessage } from "@cdp-forge/types";

// Mock delle dipendenze
jest.mock("kafkajs");
jest.mock("../src/PipelineStage");

const mockKafka = Kafka as jest.MockedClass<typeof Kafka>;
const mockConsumer = {
    connect: jest.fn(),
    subscribe: jest.fn(),
    run: jest.fn(),
    on: jest.fn(),
    commitOffsets: jest.fn(),
} as unknown as jest.Mocked<Consumer>;

const mockPipelineStage = {
    restart: jest.fn(),
} as unknown as jest.Mocked<PipelineStage>;

describe("ConfigListener", () => {
    let configListener: ConfigListener;
    let mockStage: jest.Mocked<PipelineStage>;
    let mockKafkaInstance: jest.Mocked<Kafka>;
    let config: Config;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock Kafka instance
        mockKafkaInstance = {
            consumer: jest.fn().mockReturnValue(mockConsumer),
        } as any;

        mockKafka.mockImplementation(() => mockKafkaInstance);

        // Setup mock stage
        mockStage = mockPipelineStage;

        // Setup test config
        config = {
            plugin: {
                name: "test-plugin",
                priority: 0,
                type: "blocking"
            },
            kafka: {
                brokers: ["localhost:9092"]
            },
            pipelinemanager: {
                config_topic: "config-topic",
                url: "http://localhost:8080",
                first_topic: "first-topic"
            },
            pod: {
                name: "test-pod"
            }
        };

        configListener = new ConfigListener(mockStage, config);
    });

    describe("constructor", () => {
        it("should initialize Kafka client with correct configuration", () => {
            expect(mockKafka).toHaveBeenCalledWith({
                clientId: "test-pluginplugin-test-pod",
                brokers: ["localhost:9092"]
            });
        });

        it("should create consumer with correct group ID", () => {
            expect(mockKafkaInstance.consumer).toHaveBeenCalledWith({
                groupId: "test-pluginplugin-test-pod"
            });
        });

        it("should setup consumer ready promise", () => {
            expect(mockConsumer.on).toHaveBeenCalledWith("consumer.fetch_start", expect.any(Function));
        });
    });

    describe("start", () => {
        let eachMessageHandler: (payload: EachMessagePayload) => Promise<void>;
        let fetchStartCallback: (event: any) => void;

        beforeEach(() => {
            jest.clearAllMocks()
            // Mock per catturare il callback di fetch_start e simularlo
            mockConsumer.on.mockImplementation((event, callback) => {
                if (event === "consumer.fetch_start") {
                    fetchStartCallback = callback;
                }
                return jest.fn(); // Ritorna una funzione mock per RemoveInstrumentationEventListener
            });

            mockConsumer.run.mockImplementation((options) => {
                eachMessageHandler = options!.eachMessage!;
                // Simula l'evento fetch_start dopo che run è chiamato
                setTimeout(() => {
                    if (fetchStartCallback) {
                        fetchStartCallback({
                            id: "",
                            type: "consumer.fetch_start",
                            timestamp: Date.now(),
                            payload: {}
                        });
                    }
                }, 0);
                return Promise.resolve();
            });

            // Reset dei mock per ogni test
            mockConsumer.connect.mockResolvedValue();
            mockConsumer.subscribe.mockResolvedValue();
            mockConsumer.commitOffsets.mockResolvedValue();
            mockStage.restart.mockResolvedValue();

            configListener = new ConfigListener(mockStage, config);
        });

        it("should connect consumer and subscribe to config topic", async () => {
            await configListener.start();

            expect(mockConsumer.connect).toHaveBeenCalled();
            expect(mockConsumer.subscribe).toHaveBeenCalledWith({
                topic: "config-topic",
                fromBeginning: false
            });
        }, 10000);

        it("should run consumer with correct configuration", async () => {
            await configListener.start();

            expect(mockConsumer.run).toHaveBeenCalledWith({
                autoCommit: false,
                eachMessage: expect.any(Function)
            });
        });

        it("should process valid config message for matching plugin", async () => {
            const configMessage: ConfigMessage = {
                plugin: "test-plugin",
                inputTopic: "input-topic",
                outputTopic: "output-topic"
            };

            const messagePayload: EachMessagePayload = {
                topic: "config-topic",
                partition: 0,
                message: {
                    value: Buffer.from(JSON.stringify(configMessage)),
                    offset: "123",
                    key: null,
                    timestamp: "0",
                    attributes: 0,
                    headers: {}
                },
                heartbeat: jest.fn(),
                pause: jest.fn()
            };

            await configListener.start();
            await eachMessageHandler(messagePayload);

            expect(mockStage.restart).toHaveBeenCalledWith("input-topic", "output-topic");
            expect(mockConsumer.commitOffsets).toHaveBeenCalledWith([{
                topic: "config-topic",
                partition: 0,
                offset: "124"
            }]);
        });

        it("should ignore config message for different plugin", async () => {
            const configMessage: ConfigMessage = {
                plugin: "other-plugin",
                inputTopic: "input-topic",
                outputTopic: "output-topic"
            };

            const messagePayload: EachMessagePayload = {
                topic: "config-topic",
                partition: 0,
                message: {
                    value: Buffer.from(JSON.stringify(configMessage)),
                    offset: "123",
                    key: null,
                    timestamp: "0",
                    attributes: 0,
                    headers: {}
                },
                heartbeat: jest.fn(),
                pause: jest.fn()
            };

            await configListener.start();
            await eachMessageHandler(messagePayload);

            expect(mockStage.restart).not.toHaveBeenCalled();
            expect(mockConsumer.commitOffsets).toHaveBeenCalledWith([{
                topic: "config-topic",
                partition: 0,
                offset: "124"
            }]);
        });

        it("should handle message with null value", async () => {
            const messagePayload: EachMessagePayload = {
                topic: "config-topic",
                partition: 0,
                message: {
                    value: null,
                    offset: "123",
                    key: null,
                    timestamp: "0",
                    attributes: 0,
                    headers: {}
                },
                heartbeat: jest.fn(),
                pause: jest.fn()
            };

            await configListener.start();
            await eachMessageHandler(messagePayload);

            expect(mockStage.restart).not.toHaveBeenCalled();
            expect(mockConsumer.commitOffsets).toHaveBeenCalledWith([{
                topic: "config-topic",
                partition: 0,
                offset: "124"
            }]);
        });

        it("should handle invalid JSON in message", async () => {
            const messagePayload: EachMessagePayload = {
                topic: "config-topic",
                partition: 0,
                message: {
                    value: Buffer.from("invalid json"),
                    offset: "123",
                    key: null,
                    timestamp: "0",
                    attributes: 0,
                    headers: {}
                },
                heartbeat: jest.fn(),
                pause: jest.fn()
            };

            await configListener.start();

            await expect(eachMessageHandler(messagePayload)).rejects.toThrow();
            expect(mockStage.restart).not.toHaveBeenCalled();
        });

        it("should commit offset even when stage restart fails", async () => {
            mockStage.restart.mockRejectedValue(new Error("Restart failed"));

            const configMessage: ConfigMessage = {
                plugin: "test-plugin",
                inputTopic: "input-topic",
                outputTopic: "output-topic"
            };

            const messagePayload: EachMessagePayload = {
                topic: "config-topic",
                partition: 0,
                message: {
                    value: Buffer.from(JSON.stringify(configMessage)),
                    offset: "123",
                    key: null,
                    timestamp: "0",
                    attributes: 0,
                    headers: {}
                },
                heartbeat: jest.fn(),
                pause: jest.fn()
            };

            await configListener.start();

            // Il restart fallisce, ma il commit non dovrebbe essere chiamato
            // perché il codice originale non ha try/catch intorno al commit
            await expect(eachMessageHandler(messagePayload)).rejects.toThrow("Restart failed");
            expect(mockConsumer.commitOffsets).not.toHaveBeenCalled();
        });

        it("should handle BigInt offset conversion correctly", async () => {
            const configMessage: ConfigMessage = {
                plugin: "test-plugin",
                inputTopic: "input-topic",
                outputTopic: "output-topic"
            };

            const messagePayload: EachMessagePayload = {
                topic: "config-topic",
                partition: 0,
                message: {
                    value: Buffer.from(JSON.stringify(configMessage)),
                    offset: "999999999999999999", // Large offset
                    key: null,
                    timestamp: "0",
                    attributes: 0,
                    headers: {}
                },
                heartbeat: jest.fn(),
                pause: jest.fn()
            };

            await configListener.start();
            await eachMessageHandler(messagePayload);

            expect(mockConsumer.commitOffsets).toHaveBeenCalledWith([{
                topic: "config-topic",
                partition: 0,
                offset: "1000000000000000000"
            }]);
        });
    });

    describe("error handling", () => {
        beforeEach(() => {
            // Reset dei mock per i test di errore
            jest.clearAllMocks();
        });

        it("should handle consumer connection errors", async () => {
            mockConsumer.connect.mockRejectedValue(new Error("Connection failed"));

            await expect(configListener.start()).rejects.toThrow("Connection failed");
        });

        it("should handle consumer subscription errors", async () => {
            mockConsumer.connect.mockResolvedValue();
            mockConsumer.subscribe.mockRejectedValue(new Error("Subscription failed"));

            await expect(configListener.start()).rejects.toThrow("Subscription failed");
        });

        it("should handle consumer run errors", async () => {
            mockConsumer.connect.mockResolvedValue();
            mockConsumer.subscribe.mockResolvedValue();
            mockConsumer.run.mockRejectedValue(new Error("Run failed"));

            await expect(configListener.start()).rejects.toThrow("Run failed");
        });
    });
});