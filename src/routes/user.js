const router = require('express').Router()
const bcryti = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

// middleware
const verifyToken = require('../middleware/verifyToken')

// Helpers
const getUserByToken = require('../helpers/getUserByToken')

// Captura um usuário em especifico
router.get('/:id', verifyToken, async (req, res) => {
  const id = req.params.id

  try {
    const user = await User.findOne({ _id: id }, { password: 0 })
    return res.json({ error: null, msg: 'Login realizado com sucesso', user })
  } catch (error) {
    res.status(400).json(error)
  }
})

// Modifica o usuário logado
router.put('/', verifyToken, async (req, res) => {
  // Captura o usuário pelo token de autenticação
  const token = req.header('auth-token')
  const user = await getUserByToken(token)

  const userId = user._id.toString()

  // Captura os dados da requisição
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  const reqUserId = req.body.id

  const newUser = {
    name: name,
    email: email
  }

  // Verifica Id
  if (userId != reqUserId) {
    return res.status(400).json({ error: 'Acesso negado' })
  }

  // Verifica se os todos os campos estão preenchidos
  if (name == null || email == null || password == null) {
    return res.status(400).json({ error: 'Preencha todos os campos' })
  }

  // Verifica se as senhas são iguais
  if (password != confirmPassword) {
    return res.status(400).json({ error: 'As senhas não são iguais' })
  } else if (password == confirmPassword && password != null) {
    const salt = await bcryti.genSalt(12)
    const passwordHash = await bcryti.hash(password, salt)

    newUser.password = passwordHash
  }

  try {
    const updateUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: newUser },
      { new: true }
    )

    return res.json({
      error: null,
      msg: 'Usuário atualizado',
      data: updateUser
    })
  } catch (error) {
    return res.status(400).json(error)
  }

  return res.json({ msg: 'Funcionou' })
})

module.exports = router
