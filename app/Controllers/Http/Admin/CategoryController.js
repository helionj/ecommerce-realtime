'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with categories
 */

const Category = use('App/Models/Category')
const Transformer = use('App/Transformers/Admin/CategoryTransformer')
class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, transform, pagination }) {

    const title = request.input('title')
    const query = Category.query()

    if(title){
      query.where('title', 'LIKE', `%${title}%`)
    }
    var  categories = await query.paginate(pagination.page,pagination.limit)
    categories = await transform.paginate(categories, Transformer)
    return response.send(categories)
  }



  /**
   * Create/save a new category.
   * POST categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {

    try {

      const {title, description, image_id} = request.all()
      var category = await Category.create({title, description, image_id})
      category = await transform.item(category, Transformer)
      return response.status(201).send(category)
    } catch (error) {
      return response.status(400).send({msg: "Erro ao processar a sua solicitação"})
    }
  }

  /**
   * Display a single category.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, transform}) {
    console.log('Show categories')
    var category = await Category.findOrFail(params.id)
    category = await transform.item(category, Transformer)
    return response.send(category)
  }



  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, transform }) {

    var category = await Category.findOrFail(params.id)
    const {title, description, image_id} = request.all()
    category.merge({title, description, image_id})
    category.save()
    category = await transform(category, Transformer)
    return response.send(category)

  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {

    const category = await Category.findOrFail(params.id)
    category.delete()
    response.status(204).send({})
  }
}

module.exports = CategoryController
