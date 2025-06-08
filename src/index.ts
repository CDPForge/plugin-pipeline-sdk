import { Kafka } from 'kafkajs';
import MyPlugin from './functions/Plugin';
import Config from './config';
import PipelineStage from './PipelineStage';

const stage = new PipelineStage(new MyPlugin());
const pluginRegistrationBody = {
  name: Config.getInstance().config.pluginName,
  priority: Config.getInstance().config.priority,
  type: Config.getInstance().config.type,
};

fetch(`${Config.getInstance().config.pluginManagerUrl}/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(pluginRegistrationBody),
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


async function runPlugin(inputTopic: string,outputTopic: string|null): Promise<void> {
  
}

const handleExit = async () => {
  console.log('Arresto del server in corso...');
  await stage.stop();
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
