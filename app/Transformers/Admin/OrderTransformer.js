'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const UserTransformer = use('App/Transformer/Admin/UserTransformer')
const OrderItemTransformer = use('App/Transformer/Admin/OrderItemTransformer')
const CouponTransformer = use('App/Transformer/Admin/CouponTransformer')
const DiscountTransformer = use('App/Transformer/Admin/DiscountTransformer')

/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends BumblebeeTransformer {

  static get availableInclude(){
    return ['user', 'coupons', 'items', 'discounts']
  }
  /**
   * This method is used to transform the data.
   */
  transform (order) {
    order = order.toJSON()
    return {
     id: order.id,
     status: order.status,
     total: order.total ? parseFloat(order.total.toFixed(2)) : 0,
     date: order.created_at,
     qty_items: order.__meta && order.__meta.qty_items ? order.__meta.qty_items : 0,
     discount: order.__meta && order.__meta.discount ? order.__meta.discount : 0,
     subtotal: order.__meta && order.__meta.subtotal ? order.__meta.subtotal : 0

    }
  }

  includeUser(order){
    return this.item(order.getRelated('user'), UserTransformer)
  }

  includeItems(order){
    return this.item(order.getRelated('items'), OrderItemTransformer)
  }

  includeCoupons(order){
    return this.item(order.getRelated('coupons'), CouponTransformer)
  }

  includeDiscounts(order){
    return this.item(order.getRelated('discounts'), DiscountTransformer)
  }
}

module.exports = OrderTransformer
