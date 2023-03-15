import { run as generate } from './commands/generate'
import { run as reloadCommands } from './commands/reload-commands'
import { run as dev } from './commands/dev'
import { run as help } from './commands/help'
import { register } from 'ts-node'

const CommandNames = {
  Help: 'help',
  Generate: 'generate',
  ReloadCommands: 'reload-commands',
  Dev: 'dev'
} as const

export async function run(args: string[]) {
  const [_, __, name, folder, extension, watchMode] = args

  if (name === CommandNames.Help) return help()
  if (name === CommandNames.Generate) return generate()

  if (!folder || typeof folder !== 'string') throw new Error('first parameter must be a string')
  if (extension !== '.js' && extension !== '.ts') throw new Error('second parameter must be .js or .ts')

  if (extension === '.ts') register({
    compilerOptions: {
      "target": "es2016",
      "module": "commonjs",
      "esModuleInterop": true,
      "strict": true,
      "skipLibCheck": true,
      "noEmit": true,
    }
  })

  if (name === CommandNames.ReloadCommands) return reloadCommands(folder, extension)
  if (name === CommandNames.Dev) return dev(folder, extension, watchMode === 'watch')
}
