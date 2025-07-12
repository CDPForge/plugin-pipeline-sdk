import { PipelinePluginI } from './plugin/PipelinePluginI';
import { Config } from '@cdp-forge/types';
import PipelineStage from './PipelineStage';
import ConfigListener from './ConfigListener';
import clusterConfig from 'config';

export async function start(plugin: PipelinePluginI, pluginConfig: Config['plugin']) {
    const config: Config = Object.assign(clusterConfig.util.toObject(), { plugin: pluginConfig });
    const stage = new PipelineStage(plugin, config);
    const configListener = new ConfigListener(stage, config);
    await configListener.start();
    const res = await fetch(`${config.pipelinemanager!.url}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config.plugin),
    });
    if (!res.ok) {
        throw new Error(`Failed to register plugin with Template Manager: ${res.statusText}, request: ${JSON.stringify(config.plugin)}`);
    }

    const handleExit = async () => {
      console.log('Arresto del server in corso...');
      await stage.stop();
      process.exit(0);
    };
    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
  
    console.log('Server avviato con successo con plugin personalizzato');
    return { stage, configListener };
  }