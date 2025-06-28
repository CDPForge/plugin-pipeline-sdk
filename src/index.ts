// Esportazioni principali della libreria
export { default as PipelinePluginI } from './plugin/PipelinePluginI';
export { default as PipelineStage } from './PipelineStage';
export { default as ConfigListener } from './ConfigListener';

// Esportazione dei tipi
export type {
  Log,
  Product,
  GoogleTopic,
  ConfigMessage,
  Config
} from './types';

// Funzione per avviare il server con il plugin di default
export { start } from './startServer';