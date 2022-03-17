require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// Models das rotas
const authRouther = require('./src/routes/auth')
const userRouther = require('./src/routes/user')
const partyRouther = require('./src/routes/party')

// Configurações
const dbName = 'Revisao'
const port = 3000

// instancia o express
const app = express()

// Determina que a API irá se comunicar via json.
app.use(express.json())

// Determina o meio de comunicação da API via imagens
app.use(express.static('public'))

// Determina o meio de integrar o back com o front
app.use(cors())

// Iremos definir nossas rotas aki
// Rota que é responsável pela criação e autenticação
app.use('/api/auth', authRouther)
app.use('/api/user', userRouther)
app.use('/api/party', partyRouther)

mongoose.connect(`mongodb://localhost/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// Rota teste
app.get('/', (req, res) => {
  res.json({ msg: 'teste' })
})

app.listen(port, () => {
  console.log('API rodando na porta http://localhost:3000/')
})
