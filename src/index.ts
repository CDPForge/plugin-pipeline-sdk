import MyPlugin from './plugin/Plugin';
import Config from './config';
import PipelineStage from './PipelineStage';
import RestEP from './RestEP';

const stage = new PipelineStage(new MyPlugin());
const restEP = new RestEP(async (body: { inputTopic: string, outputTopic: string | null }) => {
  await stage.restart(body.inputTopic, body.outputTopic);
});
const pluginRegistrationBody = {
  plugin_name: Config.getInstance().config.pluginName,
  priority: Config.getInstance().config.priority,
  type: Config.getInstance().config.type,
  callback_url: Config.getInstance().config.callback_url
};

fetch(`${Config.getInstance().config.pluginManagerUrl}/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(pluginRegistrationBody),
}).then(async res => {
  if (!res.ok) {
    throw new Error(`Failed to register plugin with Template Manager: ${await res.text()}`);
  }
  return res.json();
}).then(json => {
  if (!json || !json.inputTopic) {
    throw new Error('Failed to fetch plugin configuration from Template Manager.');
  }
  stage.start(json.inputTopic, json.outputTopic);
  restEP.start();
});

const handleExit = async () => {
  console.log('Arresto del server in corso...');
  await stage.stop();
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);