'use strict'

class AuthRegister {
  get rules () {
    return {
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed'
    }
  }

  get messages () {
    return {
      'name.required': 'O nome é obrigatório',
      'surname.required': 'O sobrenome é obrigatório',
      'email.required':'O E-mail é obrigatório',
      'email.email': 'O E-mail informado não é válido',
      'email.unique': 'Este e-mail já está em uso',
      'password.required': 'A senha é obrigatória',
      'password.confirmed': 'As senhas não são iguais'
    }
  }
}

module.exports = AuthRegister
