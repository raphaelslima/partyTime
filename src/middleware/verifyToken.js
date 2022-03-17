const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
  // Captura o token vindo da requisição
  const token = req.header('auth-token')

  if (!token) {
    return res.status(400).json({ error: 'Acesso negado' })
  }

  // Verifica se o token faz parte do sistema usando o segredo dele
  try {
    const verified = jwt.verify(token, 'nossoSegredo')
    req.user = verified
    next()
  } catch (error) {
    return res.status(400).json({ error: 'Token inválido' })
  }
}

module.exports = verifyToken
