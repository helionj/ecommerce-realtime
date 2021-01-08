'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Pagination {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle (ctx, next) {

    const page = parseInt(ctx.request.input('page'))
    const limit = parseInt(ctx.request.input('limit'))

    ctx.pagination={
      page,
      limit
    }

    const perPage = parseInt(ctx.request.input('perpage'))
    if(perPage){
      ctx.pagination.limit=perPage
    }
    await next()
  }
}

module.exports = Pagination
