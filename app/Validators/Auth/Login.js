'use strict'

class AuthLogin {
  get rules () {
    return {
      email: 'required|email',
      password: 'required'
    }
  }

  get messages () {
    return {
      'email.required':'O E-mail é obrigatório',
      'email.email': 'O E-mail informado não é válido',
      'password.required': 'A senha é obrigatória'

    }
  }
}

module.exports = AuthLogin
