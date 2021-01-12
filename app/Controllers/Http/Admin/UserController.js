'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with users
 */
const User = use('App/Models/User')
 class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, pagination}) {

    const name = request.input('name')
    const query = User.query()

    if(name){
      query.where('name', 'LIKE', `%${name}%`)
      query.orWhere('surname', 'LIKE', `%${name}%`)
      query.orWhere('email', 'LIKE', `%${name}%`)
    }

    try {
      const users = await query.paginate(pagination.page, pagination.limit)
      return response.send(users)
    } catch (error) {
      return response.status(500).send({msg: "Não foi possível encontrar o usuário"})
    }
  }



  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {

    try {
      const userData = request.only(['name', 'surname', 'email', 'password', 'image_id'])
      const user = await User.create(userData)
      return response.status(201).send(user)
    } catch (error) {
      return response.status(400).send({msg: 'Não foi possível criar o usuário'})
    }
  }


  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response }) {

    try {
      const user = await User.findOrFail(params.id)
      return response.send(user)
    } catch (error) {
      return response.status(500).send({msg: 'Não foi possível localizar o usuário'})
    }
  }


  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {

    const user = await User.findOrFail(params.id)
    try {
      const {name, surname, email, password, image_id} = request.all()
      user.merge({name, surname, email, password, image_id})
      user.save()
      return response.send(user)
    } catch (error) {
      return response.status(400).send({msg: 'Não foi possível atualizar o produto'})
    }
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {

    try {
      const user = await User.findOrFail(params.id)
      user.delete()
      response.status(204).send({})
    } catch (error) {
      response.status(500).send({msg: 'Não foi possível deletar o produto'})
    }
  }
}

module.exports = UserController
