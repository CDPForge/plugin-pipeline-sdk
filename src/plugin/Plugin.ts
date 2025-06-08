import PipelinePluginI from "./PipelinePluginI";
import { Log } from '../types';
export default class MyPlugin implements PipelinePluginI{
    elaborate(log: Log): Promise<Log | null> {
        return Promise.resolve(log);
    }
}