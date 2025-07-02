import { PipelinePluginI } from './plugin/PipelinePluginI';
import { Config } from '@cdp-forge/types';
import PipelineStage from './PipelineStage';
import ConfigListener from './ConfigListener';

export async function start(plugin: PipelinePluginI, config: Config) {
    const stage = new PipelineStage(plugin, config);
    const configListener = new ConfigListener(stage, config);
    configListener.start().then(() => {
      fetch(`${config.manager!.url}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config.plugin),
      }).then(res => {
        if (!res.ok) {
          throw new Error(`Failed to register plugin with Template Manager: ${res.statusText}`);
        }
      });
    });
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