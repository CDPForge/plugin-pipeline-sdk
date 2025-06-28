import YAML from 'yaml';
import * as fs from 'fs';
import path from 'path';
import { Config } from './types';
export default class ConfigReader {
  public static config: Config;

  public static generate(configPath: string, pluginPath: string): Config {
    ConfigReader.config = {
      ...YAML.parse(fs.readFileSync(configPath, 'utf8')),
      ...YAML.parse(fs.readFileSync(pluginPath, 'utf8'))
    };
    return ConfigReader.config;
  }
}