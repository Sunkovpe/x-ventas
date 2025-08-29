import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
  const user = m.sender
  const data = global.db.data.users[user]



  const createOwnerIds = (number) => {
    const cleanNumber = number.replace(/[^0-9]/g, '')
    return [
      cleanNumber + '@s.whatsapp.net',
      cleanNumber + '@lid'
    ]
  }

  const allOwnerIds = [
    conn.decodeJid(conn.user.id),
    ...global.owner.flatMap(([number]) => createOwnerIds(number)),
    ...(global.ownerLid || []).flatMap(([number]) => createOwnerIds(number))
  ]

  const isROwner = allOwnerIds.includes(m.sender)
  const isOwner = isROwner || m.fromMe
  const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
  const _user = global.db.data?.users?.[m.sender]
  const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user?.prem == true

  let isRAdmin = false
  let isAdmin = false
  let isGroupCreator = false
  if (m.isGroup) {
    try {
      const groupMetadata = conn.chats[m.chat]?.metadata || await conn.groupMetadata(m.chat).catch(_ => null)
      if (groupMetadata) {
        const participants = groupMetadata.participants || []
        const userData = participants.find(u => conn.decodeJid(u.id) === m.sender) || {}
        isRAdmin = userData?.admin == 'superadmin' || false
        isAdmin = isRAdmin || userData?.admin == 'admin' || false
        isGroupCreator = groupMetadata.owner === m.sender || 
                        groupMetadata.subjectOwner === m.sender ||
                        userData?.admin === 'superadmin'
      }
    } catch (error) {
      console.error('Error obteniendo metadata del grupo:', error)
    }
  }

  let userRole = 'Miembro'
  if (isROwner || isOwner) {
    if (isGroupCreator) {
      userRole = '👑 Creador del Bot y Grupo'
    } else if (isRAdmin || isAdmin) {
      userRole = '👑 Creador del Bot y Admin'
    } else {
      userRole = '👑 Creador del Bot'
    }
  } else if (isMods) {
    if (isGroupCreator) {
      userRole = 'Moderador del Bot y Creador'
    } else if (isRAdmin || isAdmin) {
      userRole = 'Moderador del Bot y Admin'
    } else {
      userRole = 'Moderador del Bot'
    }
  } else if (isGroupCreator) {
    userRole = 'Creador del Grupo'
  } else if (isRAdmin || isAdmin) {
    userRole = 'Admin del Grupo'
  }

  const texto = `
✿ Perfil de ${data.name || await conn.getName(user)}

✿ Nombre: ${data.name || 'No establecido'}
✿ Género: ${data.genre || 'No establecido'}
✿ Cumpleaños: ${data.birth || 'No registrado'}
✿ Descripción: ${data.desc || 'Sin descripción'}
✿ Favorito: ${data.favourite || 'No establecido'}
✿ Nivel: ${data.level || 0}
✿ Coins: ${data.coins || 0}
✿ Experiencia: ${data.exp || 0}

❒ ID: ${user}
❒ Rol: ${userRole}
❒ Registrado: ${data.registered ? 'Sí' : 'No'}
  `.trim()

  const botNumber = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botNumber, 'config.json')

  let imgBot = './storage/img/menu3.jpg'
  let hasUserPP = false

  try {
    const pp = await conn.profilePictureUrl(user, 'image')
    if (pp) {
      imgBot = pp
      hasUserPP = true
    }
  } catch (e) {
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.img) imgBot = config.img
      } catch {}
    }
  }

  if (hasUserPP) {
    await conn.sendMessage(m.chat, {
      image: { url: imgBot },
      caption: texto,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [data.partner || user]
      }
    }, { quoted: m })
  } else {
    await conn.sendFile(m.chat, imgBot, 'profile.jpg', texto, m, null, rcanal, { mentions: [data.partner || user] })
  }
}

handler.help = ['#profile • #perfil\n→ Revisa tu perfil completo con estadísticas y logros']
handler.tags = ['perfiles']
handler.command = ['profile', 'perfil']
export default handler