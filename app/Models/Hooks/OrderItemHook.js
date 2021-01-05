'use strict'

const OrderItemHook = exports = module.exports = {}

const Product = use('App/Models/Product')
OrderItemHook.updateSubTotal = async orderItem => {

  let product = await Product.find(orderItem.product_id)
  orderItem.subtotal = product.price * orderItem.quantity
}
