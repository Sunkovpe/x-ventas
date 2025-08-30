import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['51957715814', 'X VENTAS', true],
]


global.ownerLid = [
  ['77206885785728', 'X-VENTAS', true],


]

global.sessions = 'Sessions'
global.bot = 'Serbot' 
global.AFBots = true

global.packname = 'X ADM'
global.namebot = 'X-ADM'
global.author = 'X VENTAS'


global.canal = 'https://whatsapp.com/channel/0029VbAfIxz9WtC9yM4R5g2x'

global.ch = {
ch1: '120363403162100537@newsletter',
}

global.mods =   []
global.prems = []

global.multiplier = 69 
global.maxwarn = '2'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
