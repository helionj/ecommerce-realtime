'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with coupoms
 */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Services/Coupon/CouponService')
const Transformer = use('App/Transformers/Admin/CouponTransformer')
class CouponController {
  /**
   * Show a list of all coupoms.
   * GET coupoms
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index ({ request, response, pagination, transform }) {
    const code = request.input('code')
    const query = Coupon.query()
    const Database = use('Database')

    if(code){
      query.where('code', 'LIKE', `%${code}%`)
    }

    var coupons = await query.paginate(pagination.page, pagination.limit)
    coupons = await transform.paginate(coupons, Transformer)

    return response.send(coupons)
  }

  /**
   * Render a form to be used for creating a new coupom.
   * GET coupoms/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new coupom.
   * POST coupoms
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {

    const trx = Database.beginTransaction()

    var can_use_for ={
      client: false,
      product: false
    }

    try {

      const couponData = request.only([
        'code',
        'discount',
        'valid_form',
        'valid_until',
        'quantity',
        'type',
        'recursive'
      ])

      const {users, products} = request.only(['users', 'products'])

      var coupon = await Coupon.create(couponData, trx)

      const service = new Service(coupon, trx)

      if(users && users.length > 0){
        await service.syncUsers(users)
        can_use_for.client = true
      }

      if(products && products.length > 0){
        await service.syncProducts(products)
        can_use_for.product =true
      }

      if(can_use_for.product && can_use_for.client){
        coupon.can_use_for = 'product_client'
      }else if(can_use_for.product && !can_use_for.client){
        coupon.can_use_for = 'product'
      }else if(!can_use_for.product && can_use_for.client){
        coupon.can_use_for = 'client'
      }else{
        coupon_use_for = 'all'
      }

      await coupon.save(trx)
      await trx.commit()

      coupon = await transform.item(coupon, Transformer)

      return response.status(201).send(coupon)

    } catch (error) {

      await trx.rollback()
      return response.status(400).send({msg: 'Não foi possível criar o cupom'})
    }
  }

  /**
   * Display a single coupom.
   * GET coupoms/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, transform }) {

    var coupon = await Coupon.findOrFail(params.id)
    coupon = await transform.item(coupon, Transformer)

    return response.send(coupon)
  }

  /**
   * Render a form to update an existing coupom.
   * GET coupoms/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update coupom details.
   * PUT or PATCH coupoms/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, transform }) {

    const trx = await Database.beginTransaction()
    var coupon = await Coupon.findOrFail(params.id)

    var can_use_for ={
      client: false,
      product: false
    }

    try {

    const couponData = request.only([
      'code',
      'discount',
      'valid_form',
      'valid_until',
      'quantity',
      'type',
      'recursive'
    ])

    coupon.merge(couponData)


    const {users, products} = request.only(['users', 'products'])
    const service = new Service(coupon, trx)

    if(users && users.length > 0){
      await service.syncUsers(users)
      can_use_for.client = true
    }

    if(products && products.length > 0){
      await service.syncProducts(products)
      can_use_for.product =true
    }

    if(can_use_for.product && can_use_for.client){
      coupon.can_use_for = 'product_client'
    }else if(can_use_for.product && !can_use_for.client){
      coupon.can_use_for = 'product'
    }else if(!can_use_for.product && can_use_for.client){
      coupon.can_use_for = 'client'
    }else{
      coupon_use_for = 'all'
    }

    await coupon.save(trx)
    await trx.commit()
    coupon = await transform.item(coupon, Transformer)
    return response.send(coupon)
    } catch (error) {

      await trx.rollback()
      return response.status(400).send({msg: "Não foi possível atualizar o cupom"})
    }

  }

  /**
   * Delete a coupom with id.
   * DELETE coupoms/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {

    const trx = await Database.beginTransaction()
    const coupon = await Coupon.findOrFail(params.id)
    try {
      await coupon.products().detach([], trx)
      await coupon.orders().detach([], trx)
      await coupon.users().detach([], trx)
      await coupon.delete(trx)
      await trx.commit
      return response.status(204).send()


    } catch (error) {
      await trx.rollback()
      return response.status(400).send({msg: "Não foi possível deletar o cupom"})
    }

  }
}

module.exports = CouponController
