# CDP Forge Plugin Pipeline Template

Template to easily implement a plugin pipeline for CDP Forge Platform

This project serves as a template for building plugins that can be integrated into the CDP Forge Platform's data processing pipeline. It is designed to simplify the development of custom data transformation and processing logic within the platform's ecosystem.

## Features

- **Plugin Pipeline:** Provides a structure for creating plugins that fit into a sequential or parallel processing pipeline.
- **Kafka Integration:** Leverages Kafka for asynchronous communication and data streaming between pipeline stages.
- **TypeScript:** Written in TypeScript for improved code maintainability, type safety, and developer productivity.

## Plugin Development

To create a new plugin, follow these steps:

1. Configure the `config.yml` file correctly (see structure below).
2. Implement the `elaborate` function in the `Plugin.ts` class.

Depending on the plugin type:
- For **`blocking`** plugins, the `elaborate` function must return a `Promise<Log>`.
- For **`parallel`** plugins, the `elaborate` function must return a `Promise<void>`.

### `config.yml` Structure

```yaml
kafkaConfig:
  brokers:
    - 'localhost:36715'
pluginName: 'myPlugin'
pluginManagerUrl: 'https://plugin_template_url'
priority: 1      
type: 'blocking'
```

### Field Descriptions

- **`kafkaConfig.brokers`**  
  A list of Kafka broker addresses the plugin will connect to.

- **`pluginName`**  
  A unique identifier for the plugin instance.

- **`pluginManagerUrl`**  
  The URL used to register or communicate with the plugin manager.

- **`priority`**  
  (Required only for `blocking` plugins)  
  An integer from **1 to 100** that defines the plugin's execution order within the pipeline. A lower number means higher priority, therefore plugin with priority 1 will be executed before plugins with priority 2,3,4...

- **`type`**  
  Defines the plugin execution mode:  
  - `blocking`: The plugin processes data and returns a `Promise<Log>` for the next stage.  
  - `parallel`: The plugin runs independently and returns a `Promise<void>`.