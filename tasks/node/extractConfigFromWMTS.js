const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const console = require('console')

const prog = path.basename(__filename)

const options = yargs
  .usage('Usage: $0 [options]')
  .option('config', {
    demandOption: true,
    alias: 'c',
    type: 'string',
    description: 'config file'
  })
  .option('inputDir', {
    demandOption: true,
    alias: 'i',
    type: 'string',
    description: 'getcapabilities input directory'
  })
  .option('outputDir', {
    demandOption: true,
    alias: 'o',
    type: 'string',
    description: 'wmts output directory'
  })
  .epilog('Extracts configuration information from a WMTS GetCapabilities file, converts the XML to JSON')

const { argv } = options
if (!argv.config && !argv.inputDir && !argv.outputDir) {
  throw new Error('Invalid number of arguments')
}

const configFile = argv.config
const configData = fs.readFileSync(configFile)
const config = JSON.parse(configData)
// const inputDir = argv.inputDir
const outputDir = argv.outputDir

if (!Object.prototype.hasOwnProperty.call(config, 'wv-options-wmts')) {
  throw new Error(`${prog}: Error: "wv-options-wmts" not in config file`)
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

// const tolerant = config.tolerant
const entries = config['wv-options-wmts']
// let skip = []

// if (config.skip) {
//   skip = config.skip
// }

// const totalLayerCount = 0
// const totalWarningCount = 0
// const totalErrorCount = 0

async function main () {
  for (entry of entries) {
    // const { errorCount, warningCount, layerCount } = processEntry(entry)
    processEntry(entry)
  }

  console.warn(`
    ${prog}:
    ${totalErrorCount.length} errors,
    ${totalWarningCount.length} warnings,
    ${totalLayerCount.length} layers
  `)
  if (totalErrorCount > 0) {
    throw new Error(`${prog}: Error: ${totalErrorCount.length} errors occured`)
  }
}

async function processLayer (gcLayer, wvLayers, entry) {

}

async function processEntry (entry) {
  try {
    processLayer()
  } catch (error) {

  }
}

main().catch((err) => {
  console.error(err.stack)
})
