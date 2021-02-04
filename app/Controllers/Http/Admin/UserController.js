'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with users
 */
const User = use('App/Models/User')
const Transformer = use('App/Transformers/Admin/UserTransformer')
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
  async index ({ request, response, pagination, transform}) {

    const name = request.input('name')
    const query = User.query()

    if(name){
      query.where('name', 'LIKE', `%${name}%`)
      query.orWhere('surname', 'LIKE', `%${name}%`)
      query.orWhere('email', 'LIKE', `%${name}%`)
    }

    try {
      var users = await query.paginate(pagination.page, pagination.limit)
      users = await transform.paginate(users, Transformer)
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
  async store ({ request, response, transform }) {

    try {
      const userData = request.only(['name', 'surname', 'email', 'password', 'image_id'])
      var user = await User.create(userData)
      user = await transform.item(user, Transformer)
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
  async show ({ params, request, response, transform }) {

    try {
      var user = await User.findOrFail(params.id)
      user = await transform.item(user, Transformer)
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

    var user = await User.findOrFail(params.id)
    try {
      const {name, surname, email, password, image_id} = request.all()
      user.merge({name, surname, email, password, image_id})
      user.save()
      user = await transform.item(user, Transformer)
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
