'strict'

const Database = use('Database')
class OrderService{

  constructor(model, trx=false){
    this.model = model
    this.trx = trx
  }

  async syncItems(items){

    if(!Array.isArray(items)){
      return false
    }

    await this.model.items().delete(this.trx)
    await this.model.items().createMany(items, this.trx)

  }

  async updateItems(items){

    let currentItems = await this.model.items().whereIn('id', items.map(item => item.id)).fetch()

    //
    await this.model.whereNotIn('id', items.map(item => item.id)).delete(this.trx)

    await Promise.all(currentItems.rows.map(async item => {
      item.fill(items.find( n => n.id === item.id))
      await item.save(this.trx)
    }))
  }

  async canApplyDiscount(coupon){

    const now = new Date().getTime()
    if(now > coupon.valid_from.getTime()||(typeof coupon.valid_until == 'object' && coupon.valid_until.getTime() < now)){
      return false

      //verifica se o cupom já entrou em validade
      //verifica se há uma data de expiração
      //se há uma data de expiração, verifica se o cupom está expirado
    }

    const couponProducts = await Database
        .from('coupon_products')
        .where('coupon_id', coupon.id).pluck('product_id')

    const couponClients = await Database
        .from('coupon_user')
        .where('coupon_id', coupon.id).pluck('user_id')

    //verificar se o cupom está associado a um produto o cliente especifico.

    if(Array.isArray(couponProducts)&& couponProducts.length < 1 && Array.isArray(couponClients) && couponClients < 1){
      /**
       * Caso não esteja associado a cliente ou produto especifico é de uso livre
       */

       return true
    }

    let isAssociatedToProducts, isAssociatedToClients = false

    if(Array.isArray(couponProducts)&& couponProducts.length > 0){
      isAssociatedToProducts = true
    }

    if(Array.isArray(couponClients) && couponClients > 0){
      isAssociatedToClients = true
    }

    //checa na tabela order_items se existe algum produto com direito a cupom de desconto
    const productsMatch = await Database.from('order_items')
        .where('order_id', this.model.id)
        .whereIn('product_id', couponProducts)


  /**
   * Caso de uso 1 - O cupom está associado ao cliente e ao produto
   */

  if(isAssociatedToClients && isAssociatedToProducts){

    const clientMatch = await couponClients.find(client => client.id === this.model.user_id)

    if(clientMatch && Array.isArray(productsMatch) && productsMatch > 0){
      return true
    }
  }

  /**
  * Caso de uso 2 - O cupom está associado somente a produtos
  */

  if(isAssociatedToProducts && Array.isArray(productsMatch) && productsMatch.length > 0){
     return true
  }

  /**
  * Caso de uso 3 - O cupom está associado somente a clientes
  */

  if(isAssociatedToClients && Array.isArray(couponClients)&& couponClients.length > 0){

    const match = couponClients.find( client => client.id === this.model.user_id)
    if(match){
      return true
    }
  }

  /**
   * Caso nenhuma das verificaçoes acima deem positivas então o cupom
   * está associado a clientes ou produtos ou aos dois, porém nehum produto deste pedido
   * ou cliente estão elegiveis ao desconto.
   */

  return false


  }
}

module.exports = OrderService

