// Cria e manipula as rotas
const router = require('express').Router()

// Cria senhas criptografadas
const bcrypt = require('bcrypt')

// Realiza a autenticação do usuário pelo token
const jwt = require('jsonwebtoken')

const User = require('../models/user')

// Cria usuário
router.post('/', async (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword

  // Verifica se todos os campos estão preenchidos
  if (
    (name == null || email == null || password == null, confirmPassword == null)
  ) {
    return res.status(400).json({ error: 'Por favor preencha todos os campos' })
  }

  // Confere se as senhas batem
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'As senhas não são iguais' })
  }

  // Verifica se o email já foi  cadastrado
  const checkEmail = await User.findOne({ email: email })

  if (checkEmail) {
    return res.status(400).json({ error: 'Email já cadastrado' })
  }

  // Criptografar a senha
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  // Cria novo usuário
  const user = new User({
    name: name,
    email: email,
    password: passwordHash
  })

  // Salvar o usuário no DB e criar seu token de autenticação
  try {
    const newUser = await user.save()

    const token = jwt.sign(
      {
        name: newUser.name,
        id: newUser._id
      },
      'nossoSegredo'
    )

    res.json({
      error: null,
      msg: 'Cadastro realizado com sucesso',
      data: newUser,
      token: token
    })
  } catch (error) {
    return res.status(400).json({ error })
  }
})

// Realiza o login do usuário
router.post('/login', async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  // Verifica se p usuário existe
  const user = await User.findOne({ email: email })

  if (!user) {
    return res.status(400).json({ error: 'Usuario não exste' })
  }

  // Verifica se a senha pertence ao usário
  const checkPassword = await bcrypt.compare(password, user.password)

  if (!checkPassword) {
    return res.status(400).json({ error: 'Senha incorreta.' })
  }

  // Se tudo estiver certo iremos criar um token para o usuário logado
  const token = jwt.sign(
    {
      name: user.name,
      id: user._id
    },
    'nossoSegredo'
  )

  return res.json({ errors: null, msg: 'logou', token, data: user })
})

module.exports = router
