const chalk = require('chalk')
const terminal = require('@poi/dev-utils/terminal')
const logger = require('@poi/logger')

function outputStats(stats) {
  console.log(
    stats.toString({
      colors: true,
      chunks: false,
      modules: false,
      children: false,
      version: false,
      hash: false,
      timings: false
    })
  )
}

module.exports = class FancyLogPlugin {
  constructor(opts) {
    this.opts = opts
  }

  apply(compiler) {
    if (this.opts.command === 'build') {
      compiler.hooks.compile.tap('fancy-log-compile', () => {
        this.clearScreen()
      })
    }

    compiler.hooks.done.tap('fancy-log-done', stats => {
      this.clearScreen()

      if (stats.hasErrors()) {
        process.exitCode = 1
        outputStats(stats)
        console.log()
        logger.error('Compiled with errors!')
        console.log()
        return
      }

      if (stats.hasWarnings()) {
        process.exitCode = 1
        outputStats(stats)
        console.log()
        logger.error('Compiled with warnings!')
        console.log()
        return
      }

      this.displaySuccess(stats)
    })

    compiler.hooks.invalid.tap('fancy-log-invalid', () => {
      this.clearScreen()
      logger.progress('Compiling...')
      console.log()
    })
  }

  clearScreen() {
    if (this.opts.clearScreen !== false) {
      terminal.clear()
    }
    return this
  }

  displaySuccess(stats) {
    logger.success(
      chalk.green(`Built in ${stats.endTime - stats.startTime}ms.`)
    )
    process.exitCode = 0
  }
}
