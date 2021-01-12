'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with products
 */
const Product = use('App/Models/Product')
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, pagination }) {

    const name = request.input('name')
    const query = Product.query()

    if(name){
      query.where('name', 'LIKE', `%${name}%`)
    }
    const products = await query.paginate(pagination.page,pagination.limit)
    return response.send(products)

  }


  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {

    try {
      const {name, description, price, image_id} = request.all()

      const product = await Product.create( {name, description, price, image_id})
      response.status(201).send(product)
    } catch (error) {
      response.status(400).send({msg: 'Não foi possível criar o produto'})
    }

  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {

    try {
      const product = await Product.findOrFail(params.id)
      return response.send(product)
    } catch (error) {
      return response.status(500).send({msg: 'Não foi possível localizar o produto'})
    }

  }



  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {

    const product = await Product.findOrFail(params.id)
    try {
      const {name, description, price, image_id} = request.all()
      product.merge({name, description, price, image_id})
      product.save()
      return response.send(product)
    } catch (error) {
      return response.status(400).send({msg: 'Não foi possível atualizar o produto'})
    }

  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {

    try {
      const product = await Product.findOrFail(params.id)
    product.delete()
    response.status(204).send({})
    } catch (error) {
      response.status(500).send({msg: 'Não foi possível deletar o produto'})
    }

  }
}

module.exports = ProductController
