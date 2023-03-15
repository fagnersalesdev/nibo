import ejs from 'ejs'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function createFolderIfNotExists(at: string) {
  if (!existsSync(at)) mkdirSync(at)
}

function validateCommandsFolder() {
  createFolderIfNotExists(join(process.cwd(), 'src'))
  createFolderIfNotExists(join(process.cwd(), 'src/commands'))
}

function createCommandBoilerplate(commandName: string) {
  const commandBuildTemplate = readFileSync(join(__dirname, '../../templates/commandBuild.ejs'), 'utf-8')
  const commandCommandTemplate = readFileSync(join(__dirname, '../../templates/commandCommand.ejs'), 'utf-8')

  console.log('Creating Command:', commandName)

  const commandsFolder = join(process.cwd(), 'src/commands')

  const splitted = commandName.split('/')

  if (splitted.length === 1) {
    const at = join(commandsFolder, splitted[0])

    createFolderIfNotExists(at)

    writeFileSync(join(at, 'command.ts'), ejs.render(commandCommandTemplate))
    writeFileSync(join(at, 'build.ts'), ejs.render(commandBuildTemplate))
  } else {
    for (let index = 0; index < splitted.length; index++) {
      const folderPath = index === 0 ? [splitted[0]] : splitted.slice(0, index + 1)
      const at = join(commandsFolder, folderPath.join('/'))
      createFolderIfNotExists(at)

      if (index === splitted.length - 1) {
        writeFileSync(join(at, 'command.ts'), commandCommandTemplate)
        writeFileSync(join(at, 'build.ts'), commandBuildTemplate)
      }
    }
  }
}

function createConfigurationFile() {
  const path = join(process.cwd(), 'src/nibo.config.ts')

  if (existsSync(path)) {
    console.log('src/nibo.config.ts already exists')
    process.exit(1)
  }

  const configurationFileTemplate = readFileSync(join(__dirname, '../../templates/config.ejs'), 'utf-8')

  writeFileSync(path, configurationFileTemplate)
}

export async function run() {
  const inquirer = (await import('inquirer')).default

  const answers = await inquirer.prompt([
    {
      name: 'generate_option',
      message: 'Select what you want to generate...',
      choices: [
        { name: 'Command' },
        { name: 'Configuration File' },
        { name: 'Event', disabled: true },
        { name: 'Project', disabled: true },
      ],
      type: 'list'
    },
  ])

  const { generate_option } = answers

  if (generate_option === 'Command') {
    const { name } = await inquirer.prompt({
      name: 'name',
      message: 'What will be the name of the command?'
    })


    validateCommandsFolder()
    createCommandBoilerplate(name)

    console.log(`SUcessfully wrote ${name} command`)
  }

  if (generate_option === 'Configuration File') {
    createConfigurationFile()
    console.log(`SUcessfully generated config file`)
  }
}