'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Order extends Model {

  static boot(){
    super.boot()

    this.addHook('afterFind', 'OrderHook.updateValues')
    this.addHook('afterPaginate', 'OrderHook.updateCollectionValues')
  }

  items(){
    return this.hasMany('App/Model/OrderItem')
  }

  coupons() {
    return this.belongsToMany('App/Model/Coupon')
  }

  discounts() {
    return this.hasMany('App/Models/Discount')
  }

  user() {
    return this.belongsTo('App/Model/User', 'user_id', 'id')
  }
}

module.exports = Order
