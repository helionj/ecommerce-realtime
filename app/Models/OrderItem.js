'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderItem extends Model {

  static boot(){
    super.boot()

    this.addHook('beforeSave', 'OrderItemHook.updateSubTotal')
  }

  static get traits () {
    return ['App/Traits/NoTimeStamp']
  }

  product(){
    this.belongsTo('App/Models/Product')
  }

  order(){
    this.belongsTo('App/Models/Order')
  }
}

module.exports = OrderItem
