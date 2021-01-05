'use strict'

const Order = require('../Order')

const OrderHook = exports = module.exports = {}

OrderHook.updateValues = async (model) => {
  model.$sideLoaded.subtotal =await model.items().getSum('subtotal')
  model.$sideLoaded.qty_items = await model.items().getSum('quantity')
  model.$sideLoaded.discount = await model.discounts().getSum('discount')
  model.total = model.$sideLoaded.subtotal - model.$sideLoaded.discount
}

OrderHook.updateCollectionValues = async orders => {

  orders.forEach(order => {
    order = await OrderHook.updateValues(order)
  });
}
