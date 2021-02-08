'use strict'

const Order = require('../Order')

const OrderHook = (exports = module.exports = {})

OrderHook.updateValues = async (model) => {
  try {

    model.$sideLoaded.subtotal =await model.items().getSum('subtotal')
    model.$sideLoaded.qty_items = await model.items().getSum('quantity')
    model.$sideLoaded.discount = await model.discounts().getSum('discount')
    model.total = model.$sideLoaded.subtotal - model.$sideLoaded.discount
  } catch (error) {
    console.log(error.message)
  }

}

OrderHook.updateCollectionValues = async models => {

  for(let model of models){
    model = await OrderHook.updateValues(model)
  }
}
