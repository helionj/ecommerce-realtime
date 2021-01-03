'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {

  //Relationship between Product and Image (featured image)

  image(){
    return  this.belongsTo('App/Models/Image')
  }

  //Relationship between Product and Images

  images(){
    return this.belongsToMany('App/Model/Image')
  }

  //Relationship between Product and Images

  categories(){
    return this.belongsToMany('App/Models/Category')
  }

  //Relationship between Product and Coupons

  coupons(){
    return this.belongsToMany('App/Model/Coupon')
  }
}

module.exports = Product
