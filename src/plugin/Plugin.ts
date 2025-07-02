import { PipelinePluginI } from "./PipelinePluginI";
import { Log } from '@cdp-forge/types';
export default class MyPlugin implements PipelinePluginI{
    elaborate(log: Log): Promise<Log | null> {
        return Promise.resolve(log);
    }

    init(): Promise<void> {
        return Promise.resolve();
    }
}