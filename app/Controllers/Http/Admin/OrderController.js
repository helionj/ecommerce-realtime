'use strict'

const { findOrFail } = require('../../../Models/Coupon')
const Coupon = require('../../../Models/Coupon')
const Discount = require('../../../Models/Discount')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with orders
 */

const Order = use('App/Models/Order')
const Database = use('Database')
const Service = use('App/Services/Order/OrderService')
//const Coupon = use('App/Models/Coupon')

class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index ({ request, response, pagination }) {

    const {id, status} = request.only(['id', 'status'])
    const query = Order.query()

    if(id && status){

      query.where('status', status).orWhere('id', 'LIKE', `%${id}%`)

    }else if(id){
      query.Where('id', 'LIKE', `%${id}%`)
    }else if(status){
      query.where('status', status)
    }

    const orders = await query.paginate(pagination.page, pagination.limit)

    return response.send(orders)

  }

  /**
   * Render a form to be used for creating a new order.
   * GET orders/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {

    const trx = await Database.beginTransaction()

    try {
      const {user_id, items, status} = request.all()
      let order = Order.create({user_id, status}, trx)
      const service = new Service(order, trx)
      if(items && items.length > 0){
        await service.syncItems(items)
      }
      await trx.commit()
      return response.status(201).send(order)

    } catch (error) {
        return response.status(400).send({msg: 'Não foi possível criar o pedido'})
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {

    try {
      const order = await Order.findOrFail(params.id)
      return response.send(order)
    } catch (error) {
      return response.status(500).send({msg: 'Não foi possível localizar o pedido'})
    }
  }

  /**
   * Render a form to update an existing order.
   * GET orders/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {

    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {

      const {user_id, status, items} = request.all()
      const service = new Service(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      return response.send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({msg: 'Não foi possível atualizar o pedido'})
    }

  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {

    const order = await Order.findOrFail(params.id)
    const trx = Database.beginTransaction()
    try {
      await order.items.delete(trx)
      await order.coupons.delete(trx)
      await order.delete(trx)
      await trx.commit()
      return response.status(204).send()

    } catch (error) {
      await trx.rollback()
      response.status(500).send({msg: 'Não foi possível deletar este pedido'})
    }
  }

  async applyDiscount({ params, request, response}) {

    const {code} = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const order = await Order.findOrFail(params.id)

    var discount, info ={}

    try {
      const service = new Service(order)
      const canAddDiscount = await service.canApplyDiscount(coupon)
      const orderDiscounts = await order.coupons().getCount()

      const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)
      if(canAddDiscount && canApplyToOrder){
        discount = await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        })
        info.message ='Cupom aplicado com sucesso'
        info.success = true
      }else{
        info.message = 'Não foi possível aplicar este cupom'
        info.success = false
      }

      return response.send({order, info})
    } catch (error) {
      return response.status(400).send({msg: 'Erro ao tentar aplicar o desconto'})
    }
  }

  async removeDiscount(request, response){

    const {discount_id} = request.all()
    const discount = await findOrFail(discount_id)
    await discount.delete()

    return response.status(204).send()


  }
}

module.exports = OrderController
