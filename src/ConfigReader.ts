import YAML from 'yaml';
import * as fs from 'fs';
import path from 'path';
import { Config } from './types';
export default class ConfigReader {
  private static instance: ConfigReader;
  private readonly configData: Config;

  private constructor() {
    try {
      this.configData = {
        ...YAML.parse(fs.readFileSync(path.join(__dirname, '../config/config.yml'), 'utf8')),
        ...YAML.parse(fs.readFileSync(path.join(__dirname, '../config/plugin.yml'), 'utf8'))
      };
    } catch (e) {
      console.error('Error reading or parsing config.yml:', e);
      throw e;
    }
  }

  public static getInstance(): ConfigReader {
    if (!ConfigReader.instance) {
      ConfigReader.instance = new ConfigReader();
    }
    return ConfigReader.instance;
  }

  public get config(): Config {
      return this.configData
  }
}