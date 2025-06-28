import { Log } from '@cdp-forge/types';
export default interface PipelinePluginI {
    elaborate(log: Log):  Promise<Log | null>;
    init(): Promise<void>;
}