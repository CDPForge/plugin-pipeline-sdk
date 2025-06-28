import { GoogleTopicsMap } from "./gTopics";
export interface Product {
    id: string;
    price: number;
    brand?: string;
    category?: string;
    quantity: number;
    currency?: string;
}

export interface Log {
    client: number;
    date: string;
    device: {
        browser?: string;
        id: string;
        ip?: string;
        os?: string;
        type?: string;
        userAgent?: string;
        [key: string]: any;
    };
    event: string;
    geo?: {
        city?: string;
        country?: string;
        point?: {
            type: string;
            coordinates: number[];
        };
        region?: string;
        zipCode?: string;
        timeZone?: string;
        [key: string]: any;
    };
    googleTopics?: GoogleTopic[];
    instance: number;
    page: {
        description?: string;
        href?: string;
        image?: string;
        title: string;
        type?: string;
        [key: string]: any;
    };
    product?: Product[];
    referrer?: string;
    session: string;
    target?: string;
    order?: string;
    [key: string]: any;
}

export interface GoogleTopic {
    id: keyof typeof GoogleTopicsMap;
    name: (typeof GoogleTopicsMap)[keyof typeof GoogleTopicsMap];
}

export interface ConfigMessage {
    inputTopic: string;
    outputTopic: string | null;
    plugin: string;
}

export interface Config {
    manager: {
        url: string;
        config_topic: string;
    };
    plugin: {
        name: string;
        priority: number;
        type: 'parallel' | 'blocking';
    };
    kafkaConfig: {
        brokers: string[];
    };
    mysqlConfig?: {
        uri: string;
    };
    [key: string]: any;
}