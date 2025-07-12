import {PipelinePluginI, start} from '../src/'
import {Config, Log} from "@cdp-forge/types";

const mockLog: Log = {
    // completa con proprietà necessarie
    message: 'test',
    timestamp: new Date().toISOString(),
    client: 0,
    date: '',
    device: {
        browser: undefined,
        id: '',
        ip: undefined,
        os: undefined,
        type: undefined,
        userAgent: undefined
    },
    event: '',
    instance: 0,
    page: {
        description: undefined,
        href: undefined,
        image: undefined,
        title: '',
        type: undefined
    },
    session: ''
};

const mockPlugin: jest.Mocked<PipelinePluginI> = {
    elaborate: jest.fn().mockResolvedValue(mockLog),
    init: jest.fn().mockResolvedValue(null),
};

describe('Start manual Testing', () => {
    xit('should user env variables', () => {
        const config: Config['plugin'] = {
            name: "test-plugin",
            priority: 0,
            type: "blocking"
        }
        start(mockPlugin,config);
    });
});