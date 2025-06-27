# CDP Forge Plugin Pipeline SDK

SDK for easily implementing pipeline plugins for the CDP Forge platform.

This project serves as an SDK for building plugins that can be integrated into the data processing pipeline of the CDP Forge platform. It is designed to simplify the development of custom data transformation and processing logic within the platform ecosystem.

## 📦 Installation as NPM Library

You can install this library as a dependency in other projects:

```bash
npm install plugin-pipeline-sdk
```

### Usage as Library

```typescript
import { 
    PipelinePluginI, 
    PipelineStage, 
    ConfigListener, 
    Config,
    Log,
    start
} from 'plugin-pipeline-sdk';

// Create a custom plugin
class MyCustomPlugin implements PipelinePluginI {
    async elaborate(log: Log): Promise<Log | null> {
        // Implement your processing logic
        console.log('Processing log:', log);
        return log;
    }

    async init(): Promise<void> {
        console.log('Plugin initialization');
    }
}

// Create plugin instance
const customPlugin = new MyCustomPlugin();

// Start the server with your custom plugin
start(customPlugin).then(({ stage, configListener }) => {
    console.log('Server started successfully');
}).catch(error => {
    console.error('Error during startup:', error);
});
```

## 🚀 Features

- **Pipeline Plugin:** Provides a structure for creating plugins that fit into a sequential or parallel processing pipeline
- **Kafka Integration:** Uses Kafka for asynchronous communication and data streaming between pipeline stages
- **TypeScript:** Written in TypeScript to improve code maintainability, type safety, and developer productivity
- **Docker Support:** Includes Docker configuration for deployment
- **Testing:** Jest configuration for unit tests
- **Hot Reload:** Development with nodemon for automatic reload

## 📋 Prerequisites

- Node.js 20.11.1 or higher
- npm or yarn
- Docker (optional, for deployment)
- Access to a Kafka cluster

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd plugin-pipeline-template
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the environment:**
   - Copy and modify configuration files in `config/`
   - Ensure Kafka brokers are accessible

## ⚙️ Configuration

### Configuration File Structure

The project uses two main configuration files:

#### `config/config.yml`
```yaml
kafkaConfig:
  brokers:
    - 'localhost:36715'
  config_topic: 'config'

pluginManagerUrl: 'https://plugin_template_url'
```

#### `config/plugin.yml`
```yaml
plugin:
  name: 'myPlugin'
  priority: 1 # 1 to 100 (not required if parallel)
  type: 'blocking' # or 'parallel'
```

### Field Descriptions

- **`kafkaConfig.brokers`**  
  List of Kafka broker addresses to which the plugin will connect.

- **`kafkaConfig.config_topic`**  
  Kafka topic used for plugin configuration.

- **`plugin.name`**  
  Unique identifier for the plugin instance.

- **`pluginManagerUrl`**  
  URL used to register or communicate with the plugin manager.

- **`plugin.priority`**  
  (Required only for `blocking` plugins)  
  An integer from **1 to 100** that defines the execution order of the plugin within the pipeline. A lower number means higher priority, so the plugin with priority 1 will be executed before plugins with priority 2,3,4...

- **`plugin.type`**  
  Defines the plugin execution mode:  
  - `blocking`: The plugin processes data and returns a `Promise<Log>` for the next stage.  
  - `parallel`: The plugin runs independently and returns a `Promise<void>`.

## 🔧 Plugin Development

To create a new plugin, follow these steps:

1. **Configure the `config.yml` and `plugin.yml` files correctly**
2. **Implement the `elaborate` function in the `Plugin.ts` class**

### Plugin Implementation

The plugin must implement the `PipelinePluginI` interface:

```typescript
import PipelinePluginI from "./PipelinePluginI";
import { Log } from '../types';

export default class MyPlugin implements PipelinePluginI {
    elaborate(log: Log): Promise<Log | null> {
        // Implement your processing logic here
        // For blocking plugins: return Promise<Log>
        // For parallel plugins: return Promise<void>
        return Promise.resolve(log);
    }

    init(): Promise<void> {
        // Plugin initialization
        return Promise.resolve();
    }
}
```

### Plugin Types

Depending on the plugin type:
- **`blocking` plugins**: The `elaborate` function must return a `Promise<Log>`.
- **`parallel` plugins**: The `elaborate` function must return a `Promise<void>`.

## 📁 Project Structure

```
plugin-pipeline-template/
├── config/                 # Configuration files
│   ├── config.yml         # Kafka and plugin manager configuration
│   └── plugin.yml         # Plugin-specific configuration
├── src/                   # TypeScript source code
│   ├── plugin/           # Plugin implementation
│   │   ├── Plugin.ts     # Main plugin class
│   │   └── PipelinePluginI.ts # Plugin interface
│   ├── types.ts          # Type definitions
│   ├── config.ts         # Configuration management
│   ├── index.ts          # Library entry point
│   ├── server.ts         # Server execution
│   └── ...               # Other utility files
├── examples/             # Usage examples
├── __tests__/            # Unit tests
├── Dockerfile            # Docker configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## 🚀 Available Scripts

- **`npm run build`**: Compiles TypeScript code
- **`npm start`**: Starts the compiled application
- **`npm run server`**: Runs the compiled server
- **`npm run dev`**: Starts in development mode with hot reload
- **`npm test`**: Runs unit tests
- **`npm run clean`**: Cleans the dist folder

## 🐳 Docker Deployment

1. **Build the image:**
   ```bash
   docker build -t plugin-pipeline-sdk .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 plugin-pipeline-sdk
   ```

## 📊 Data Structure

The plugin processes `Log` objects that contain:

```typescript
interface Log {
    client: number;
    date: string;
    device: {
        browser?: string;
        id: string;
        ip?: string;
        os?: string;
        type?: string;
        userAgent?: string;
    };
    event: string;
    geo?: {
        city?: string;
        country?: string;
        point?: {
            type: string;
            coordinates: number[];
        };
        region?: string;
    };
    googleTopics?: GoogleTopic[];
    instance: number;
    page: {
        description?: string;
        href?: string;
        image?: string;
        title: string;
        type?: string;
    };
    product?: Product[];
    referrer?: string;
    session: string;
    target?: string;
    order?: string;
}
```

## 📦 Publishing to NPM

To publish this library to npm, see the [Publishing Guide](PUBLISHING.md).

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the GPL-3.0 license. See the `LICENSE` file for more details.

## 📞 Support

For support and questions, please open an issue on the GitHub repository.