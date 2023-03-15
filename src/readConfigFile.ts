import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { configSchema, NiboConfig } from './types/NiboConfig'
import { brand } from './utils/brand'

export function readConfigFile(folder: string, extension: '.js' | '.ts'): NiboConfig {
  const path = join(process.cwd(), `${folder}/nibo.config${extension}`)

  console.log(`${brand} Reading config file at ${path}`)

  if (!existsSync(path)) {
    console.log(`Configuration file "${folder}/nibo.config${extension}" not found in the root/${folder} directory.`)
    process.exit(1)
  }

  const config = require(path).default as unknown

  const result = configSchema.safeParse(config)

  if (!result.success) {
    const formattedError = result.error.format()

    if (formattedError._errors[0]) {
      console.log(formattedError._errors[0])
    }

    if (formattedError.bot_id) {
      console.log(formattedError.bot_id._errors[0])
    }

    if (formattedError.bot_token) {
      console.log(formattedError.bot_token._errors[0])
    }

    if (formattedError.afterLogin) {
      console.log(formattedError.afterLogin._errors[0])
    }

    process.exit(1)
  }

  return result.data
}
