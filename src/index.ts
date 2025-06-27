import PipelinePluginI from './plugin/PipelinePluginI';
import Config from './config';
import PipelineStage from './PipelineStage';
import ConfigListener from './ConfigListener';

// Esportazioni principali della libreria
export { default as PipelinePluginI } from './plugin/PipelinePluginI';
export { default as PipelineStage } from './PipelineStage';
export { default as ConfigListener } from './ConfigListener';
export { default as Config } from './config';

// Esportazione dei tipi
export type {
  Log,
  Product,
  GoogleTopic,
  ConfigMessage
} from './types';

// Funzione per avviare il server con il plugin di default
export async function start(plugin: PipelinePluginI) {
  const stage = new PipelineStage(plugin);
  const configListener = new ConfigListener(stage);
  configListener.start().then(() => {
    fetch(`${Config.getInstance().config.pluginManagerUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Config.getInstance().config.plugin),
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Failed to register plugin with Template Manager: ${res.statusText}`);
      }
      return res.json();
    }).then(json => {
      if (!json || !json.inputTopic || !json.outputTopic) {
        throw new Error('Failed to fetch plugin configuration from Template Manager.');
      }
      stage.start(json.inputTopic, json.outputTopic);
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