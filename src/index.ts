import dotenv from 'dotenv';
dotenv.config();

import clusterConfig from 'config';
import { Config } from "@cdp-forge/types";
const config: Config = clusterConfig.util.toObject();

export { config as  clusterConfig};
export type { PipelinePluginI } from './plugin/PipelinePluginI';
export { start } from './startServer';
export type * from '@cdp-forge/types';
export { GoogleTopicsMap } from '@cdp-forge/types'