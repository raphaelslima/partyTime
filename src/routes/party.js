// Importações de extenções
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const multer = require('multer')

// importações de models
const Party = require('../models/party.js')
const User = require('../models/user.js')

//helpers
const getUserByToken = require('../helpers/getuserbytoken')
const diskStorage = require('../helpers/fileStorage')

// middleware
const verifyToken = require('../middleware/verifyToken')
const upload = multer({ storage: diskStorage })

// Cria eventos
router.post(
  '/',
  verifyToken,
  upload.fields([{ name: 'photos' }]),
  async (req, res) => {
    // Captura os dados da requisição que são passados pelo usuário
    const title = req.body.title
    const description = req.body.description
    const partyDate = req.body.partyDate
    const privacy = req.body.privacy

    // Recupera o id do usuário logado
    const token = req.header('auth-token')
    const user = await getUserByToken(token)
    const userId = user._id.toString()

    //Inicializa o array que armazena os arquivos de fotos.
    let files = []

    // Pega as fotos enviadas da requisição e coloca no array.
    if (req.files) {
      files = req.files.photos
    }

    // Coloca as fotos da requisição no array de phtos para depois salvar no banco de dados.
    let photos = []

    if (files && files.length > 0) {
      files.forEach((photo, i) => {
        photos[i] = photo.path
      })
    }

    // Verifica se os campos estão preenchidos
    if ((title == null, description == null, partyDate == null)) {
      return res.status(400).json({ error: 'Preencha todos os campos.' })
    }

    // Objeto que armazena a festa.
    const party = new Party({
      title: title,
      description: description,
      partyDate: partyDate,
      photos: photos,
      privacy: privacy,
      userId: userId
    })

    try {
      const newParty = await party.save()
      return res.status(200).json({
        error: null,
        msg: 'Festa criada com sucesso',
        newParty: newParty
      })
    } catch (error) {
      return res.status(400).json({ error })
    }
  }
)

// resgtada todos os eventos públicos
router.get('/all', async (req, res) => {
  

  try {
    const publicParties = await Party.find({ privacy: false }).sort([
      ['_id', -1]
    ])

    res.status(200).json({
      error: null,
      msg: 'Festa públicas resgatadas com sucesso',
      publicParties: publicParties
    })
  } catch (error) {
    res.status(400).json({
      error
    })
  }
})

// Resgata um evento especifico de um usuário
router.get('/partyuser/:id', verifyToken, async (req, res) => {
  // Resgata o token do usuário enviando da requisição
  const token = req.header('auth-token')

  // Resgata o usuário do db pelo token
  const user = await getUserByToken(token)

  // Pega o id do usuário
  const userId = user._id.toString()
  // Pega o id da festa nos paramets da requisição
  const partyId = req.params.id

  try {
    // resgata um afesta do db pelo id da festa e do usário logado
    const party = await Party.findOne({ _id: partyId, Userid: userId })

    res.json({ error: null, party: party })
  } catch (error) {
    res.json({ error })
  }
})

// Resgata todas as festas de um usuário
router.get('/partyuserall', verifyToken, async (req, res) => {
  // Captura o usuário pelo token
  const token = req.header('auth-token')
  const user = await getUserByToken(token)

  const userId = user._id.toString()

  try {
    const parties = await Party.find({ userId: userId })
    return res
      .status(200)
      .json({ error: null, msg: 'Funciona', parties: parties })
  } catch (error) {
    return res.status(400).json({ error })
  }
})

// Resgata festas públicas ou privadas
router.get('/:id', async (req, res) => {
  const partyId = req.params.id

  const token = req.header('auth-token')
  const user = await getUserByToken(token)
  const userId = user._id.toString()

  try {
    // Captura o evento passada pelo id dos parametros
    const party = await Party.findOne({ _id: partyId })

    // Verifica se o evento tem privacidade true e se pertence ao usuário
    if (party.privacy === false) {
      return res
        .status(200)
        .json({ error: null, msg: 'Evento encontrado', party: party })
    } else if (party.userId == userId) {
      return res
        .status(200)
        .json({ error: null, msg: 'Evento encontrado', party: party })
    } else {
      return res.status(400).json({ error: 'Acesso negado' })
    }
  } catch (error) {
    return res.status(400).json({ error: 'Evento não encontrado' })
  }
})

// Deleta uma festa
router.delete('/:id', verifyToken, async (req, res) => {
  // Verifica se o usuário está logado
  const token = req.header('auth-token')
  const user = await getUserByToken(token)

  if (!user) {
    return res.status(400).json({ error: 'Acesso negado' })
  }

  // Captura o id do usuário e o id do evento
  const userId = user._id.toString()
  const partyId = req.params.id

  // Resgata o evento se pertencer ao usuário
  try {
    await Party.deleteOne({ _id: partyId, userId: userId })
    return res
      .status(200)
      .json({ error: null, msg: 'Evento deletado com sucesso' })
  } catch (error) {
    return res.status(400).json({ error })
  }
})

// Atualiza uma festa
router.put('/:id', verifyToken, async (req, res) => {
  // Verifica se o usuário está logado
  const token = req.header('auth-token')
  const user = await getUserByToken(token)

  if (!user) {
    return res.status(400).json({ error: 'Acesso negado' })
  }

  // Captura os dados da requisição
  const title = req.body.title
  const description = req.body.description
  const partyDate = req.body.partyDate
  const privacy = req.body.privacy

  // Upload de arquivos
  //Inicializa o array que armazena os arquivos de fotos.
  let files = []

  // Pega as fotos enviadas da requisição e coloca no array.
  if (req.files) {
    files = req.files.photos
  }

  // Coloca as fotos da requisição no array de phtos para depois salvar no banco de dados.
  let photos = []

  if (files && files.length > 0) {
    files.forEach((photo, i) => {
      photos[i] = photo.path
    })
  }

  // Verifica se o usuário preencheu todos os campos
  if (
    title == null ||
    description == null ||
    partyDate == null ||
    privacy == null
  ) {
    return res
      .status(400)
      .json({ error: 'Por favor, preencha todos os campos' })
  }

  // Verifica se o evento pertence ao usuário
  const partyId = req.params.id
  const userId = user._id.toString()

  const checkParty = await Party.findOne({ _id: partyId, userId: userId })

  if (!checkParty) {
    return res.status(400).json({ error: 'Acesso negado' })
  }

  // Atualiza os dados do evento
  const party = {
    title: title,
    description: description,
    partyDate: partyDate,
    privacy: privacy,
    photos: req.body.photos,
    userId: userId
  }

  try {
    const newParty = await Party.findOneAndUpdate(
      { _id: partyId, userId: userId },
      { $set: party },
      { new: true }
    )

    return res
      .status(200)
      .json({ error: null, msg: 'Dados atualizados', newParty: newParty })
  } catch (error) {
    return res.status(400).json({ error })
  }
})

module.exports = router
