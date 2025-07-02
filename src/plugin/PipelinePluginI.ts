import { Log } from '@cdp-forge/types';
export interface PipelinePluginI {
    elaborate(log: Log):  Promise<Log | null>;
    init(): Promise<void>;
}