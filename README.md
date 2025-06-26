# CDP Forge Plugin Pipeline Template

Template per implementare facilmente un plugin pipeline per la piattaforma CDP Forge.

Questo progetto serve come template per costruire plugin che possono essere integrati nella pipeline di elaborazione dati della piattaforma CDP Forge. È progettato per semplificare lo sviluppo di logiche personalizzate di trasformazione ed elaborazione dati all'interno dell'ecosistema della piattaforma.

## 🚀 Caratteristiche

- **Plugin Pipeline:** Fornisce una struttura per creare plugin che si adattano a una pipeline di elaborazione sequenziale o parallela
- **Integrazione Kafka:** Utilizza Kafka per la comunicazione asincrona e lo streaming di dati tra le fasi della pipeline
- **TypeScript:** Scritto in TypeScript per migliorare la manutenibilità del codice, la type safety e la produttività degli sviluppatori
- **Docker Support:** Include configurazione Docker per il deployment
- **Testing:** Configurazione Jest per i test unitari
- **Hot Reload:** Sviluppo con nodemon per il reload automatico

## 📋 Prerequisiti

- Node.js 20.11.1 o superiore
- npm o yarn
- Docker (opzionale, per il deployment)
- Accesso a un cluster Kafka

## 🛠️ Installazione

1. **Clona il repository:**
   ```bash
   git clone <repository-url>
   cd plugin-pipeline-template
   ```

2. **Installa le dipendenze:**
   ```bash
   npm install
   ```

3. **Configura l'ambiente:**
   - Copia e modifica i file di configurazione in `config/`
   - Assicurati che i broker Kafka siano accessibili

## ⚙️ Configurazione

### Struttura dei File di Configurazione

Il progetto utilizza due file di configurazione principali:

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
  priority: 1 # 1 to 100 (non necessario se parallel)
  type: 'blocking' # o 'parallel'
```

### Descrizione dei Campi

- **`kafkaConfig.brokers`**  
  Lista degli indirizzi dei broker Kafka a cui il plugin si connetterà.

- **`kafkaConfig.config_topic`**  
  Topic Kafka utilizzato per la configurazione del plugin.

- **`plugin.name`**  
  Identificatore univoco per l'istanza del plugin.

- **`pluginManagerUrl`**  
  URL utilizzato per registrare o comunicare con il plugin manager.

- **`plugin.priority`**  
  (Richiesto solo per plugin `blocking`)  
  Un intero da **1 a 100** che definisce l'ordine di esecuzione del plugin all'interno della pipeline. Un numero più basso significa priorità più alta, quindi il plugin con priorità 1 verrà eseguito prima dei plugin con priorità 2,3,4...

- **`plugin.type`**  
  Definisce la modalità di esecuzione del plugin:  
  - `blocking`: Il plugin elabora i dati e restituisce una `Promise<Log>` per la fase successiva.  
  - `parallel`: Il plugin viene eseguito indipendentemente e restituisce una `Promise<void>`.

## 🔧 Sviluppo Plugin

Per creare un nuovo plugin, segui questi passaggi:

1. **Configura correttamente i file `config.yml` e `plugin.yml`**
2. **Implementa la funzione `elaborate` nella classe `Plugin.ts`**

### Implementazione del Plugin

Il plugin deve implementare l'interfaccia `PipelinePluginI`:

```typescript
import PipelinePluginI from "./PipelinePluginI";
import { Log } from '../types';

export default class MyPlugin implements PipelinePluginI {
    elaborate(log: Log): Promise<Log | null> {
        // Implementa qui la logica di elaborazione
        // Per plugin blocking: restituisci Promise<Log>
        // Per plugin parallel: restituisci Promise<void>
        return Promise.resolve(log);
    }

    init(): Promise<void> {
        // Inizializzazione del plugin
        return Promise.resolve();
    }
}
```

### Tipi di Plugin

A seconda del tipo di plugin:
- **Plugin `blocking`**: La funzione `elaborate` deve restituire una `Promise<Log>`.
- **Plugin `parallel`**: La funzione `elaborate` deve restituire una `Promise<void>`.

## 📁 Struttura del Progetto

```
plugin-pipeline-template/
├── config/                 # File di configurazione
│   ├── config.yml         # Configurazione Kafka e plugin manager
│   └── plugin.yml         # Configurazione specifica del plugin
├── src/                   # Codice sorgente TypeScript
│   ├── plugin/           # Implementazione del plugin
│   │   ├── Plugin.ts     # Classe principale del plugin
│   │   └── PipelinePluginI.ts # Interfaccia del plugin
│   ├── types.ts          # Definizioni dei tipi
│   ├── config.ts         # Gestione configurazione
│   ├── index.ts          # Entry point dell'applicazione
│   └── ...               # Altri file di utilità
├── __tests__/            # Test unitari
├── Dockerfile            # Configurazione Docker
├── package.json          # Dipendenze e script
└── tsconfig.json         # Configurazione TypeScript
```

## 🚀 Script Disponibili

- **`npm run build`**: Compila il codice TypeScript
- **`npm start`**: Avvia l'applicazione compilata
- **`npm run dev`**: Avvia in modalità sviluppo con hot reload
- **`npm test`**: Esegue i test unitari

## 🐳 Deployment con Docker

1. **Costruisci l'immagine:**
   ```bash
   docker build -t plugin-pipeline-template .
   ```

2. **Esegui il container:**
   ```bash
   docker run -p 3000:3000 plugin-pipeline-template
   ```

## 📊 Struttura dei Dati

Il plugin elabora oggetti `Log` che contengono:

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

## 🧪 Testing

Il progetto include configurazione Jest per i test unitari:

```bash
npm test
```

## 📝 Licenza

Questo progetto è rilasciato sotto licenza GPL-3.0.

## 🤝 Contributi

Per contribuire al progetto:

1. Fork del repository
2. Crea un branch per la tua feature
3. Committa le modifiche
4. Pusha al branch
5. Crea una Pull Request

## 📞 Supporto

Per supporto o domande, contatta il team CDP Forge.