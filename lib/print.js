import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'


function cleanText(text) {
  if (!text) return 'Sin nombre'
  
  
  let cleaned = text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') 
    .replace(/[\uFFF0-\uFFFF]/g, '') 
    .replace(/�/g, '') 
    .replace(/[\u200B-\u200F\u202A-\u202E]/g, '') 
    .replace(/[\uE000-\uF8FF]/g, '') 
    .trim()
  
  
  return cleaned || 'Usuario'
}


function detectDevice(m) {
  try {
    
    if (m.key && m.key.id) {
      const keyId = m.key.id
      
      
      if (keyId.startsWith('3EB0') && keyId.length === 20) {
        return 'WhatsApp Web'
      }
      
      
      if (/^[A-F0-9]{20}$/i.test(keyId)) {
        return 'Android'
      }
      
     
      if (keyId.length < 20 && /^[A-F0-9]+$/i.test(keyId)) {
        return 'iOS'
      }
    }
    
    
    if (m.message) {
    
      if (m.message.messageContextInfo || 
          (m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo)) {
        return 'WhatsApp Web'
      }
    }
    
 
    if (m.sender && m.sender.includes('@c.us')) {
      return 'WhatsApp Web'
    }
    
   
    return 'Android'
    
  } catch (error) {
    return 'Android'
  }
}


function detectMessageType(m) {
  try {
    if (!m.message) return 'Sin mensaje'
    
  
    if (m.message.imageMessage || 
        m.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      return 'imageMessage'
    }
    
     
    if (m.message.videoMessage || 
        m.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
      return 'videoMessage'
    }
    
    
    if (m.message.audioMessage || 
        m.message.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
      return 'audioMessage'
    }
    
    
    if (m.message.stickerMessage || 
        m.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
      return 'stickerMessage'
    }
    
    
    if (m.message.documentMessage || 
        m.message.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage) {
      return 'documentMessage'
    }
    
    
    if (m.message.contactMessage || 
        m.message.extendedTextMessage?.contextInfo?.quotedMessage?.contactMessage) {
      return 'contactMessage'
    }
    
  
    if (m.message.extendedTextMessage) {
      return 'extendedTextMessage'
    }
    
   
    if (m.message.conversation) {
      return 'conversation'
    }
    
    
    return m.mtype || 'Desconocido'
    
  } catch (error) {
    return 'Error'
  }
}

export default async function (m, conn = { user: {} }) {
  
  if (m.messageStubType && !m.text && !m.mtype) {
    return
  }

  
  if (m.message) {
    let rawSender = await conn.getName(m.sender) || 'Usuario'
    let rawFrom = await conn.getName(m.chat) || 'Chat'
    let rawBody = m.text || m.caption || '[Sin texto]'
    let rawPushname = m.pushName || rawSender
    
    
    let sender = cleanText(rawSender)
    let from = cleanText(rawFrom)
    let body = cleanText(rawBody)
    let pushname = cleanText(rawPushname)
    let dispositivo = detectDevice(m)
    let tipoMensaje = detectMessageType(m)
    
    if (body.length > 100) {
      body = body.substring(0, 97) + '...'
    }

    // 📌 Nuevo: Detectar tipo de chat y mostrar JIDs
    let chatTipo = 'Privado'
    if (m.chat.endsWith('@g.us')) chatTipo = 'Grupo'
    else if (m.chat.endsWith('@newsletter')) chatTipo = 'Canal'

    console.log(`
${chalk.cyan('╭───────────────────────────────')}
${chalk.cyan('│')}${chalk.yellow('〔 DE 〕:')} ${chalk.green(sender)}
${chalk.cyan('│')}${chalk.yellow('〔 CHAT 〕:')} ${chalk.blue(from)}
${chalk.cyan('│')}${chalk.yellow('〔 CHAT TIPO 〕:')} ${chalk.green(chatTipo)}
${chalk.cyan('│')}${chalk.yellow('〔 CHAT ID 〕:')} ${chalk.white(m.chat)}
${chalk.cyan('│')}${chalk.yellow('〔 SENDER ID 〕:')} ${chalk.white(m.sender)}
${chalk.cyan('│')}${chalk.yellow('〔 MENSAJE 〕:')} ${chalk.white(body)}
${chalk.cyan('│')}${chalk.yellow('〔 NiCK 〕:')} ${chalk.magenta(pushname)} 
${chalk.cyan('│')}${chalk.yellow('〔 TIPO 〕:')} ${chalk.red(tipoMensaje)}
${chalk.cyan('│')}${chalk.yellow('〔 DISPOSITIVO 〕:')} ${chalk.gray(dispositivo)}
${chalk.cyan('╰───────────────────────────────')}`)
  }
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.redBright("Update 'lib/print.js'"))
})