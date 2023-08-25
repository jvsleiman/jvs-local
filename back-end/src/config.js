import YAML from 'yaml'
import { readFile } from 'node:fs/promises'

export const config = YAML.parse(await readFile("config.yml", "utf-8"));