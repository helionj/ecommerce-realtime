'use strict'

const crypto = use('crypto')
const Helpers = use('Helpers')

/**
 * Generate random string
 *
 * @param {int} length - Indica o tamanho da string a ser gerada
 * @return {string} retorna a string gerada
 *
 */

 const str_random = async (length=40) => {

  let strRandom = ''
  let len = strRandom.length

  if(len < length){

    let size = length - len
    let bytes = await crypto.randomBytes(size)
    let buffer = new Buffer.from(bytes)
    strRandom+= buffer.toString('base64').replace(/[^a-zA-z0-Z0-9]/g, '').substr(0, size)
  }
  return strRandom
 }

 module.exports = {
   str_random
 }
