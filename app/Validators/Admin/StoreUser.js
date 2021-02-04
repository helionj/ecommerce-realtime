'use strict'

class AdminStoreUser {
  get rules () {

    let userId = this.ctx.params.id
    let rule = ''
    if(userId){

      rule = `unique:users,email,id,${userId}`
    }else{
      rule ='unique:users,email|required'
    }

    return {
      email: rule,
      image_id: 'exists:images,id'
    }
  }
}

module.exports = AdminStoreUser
