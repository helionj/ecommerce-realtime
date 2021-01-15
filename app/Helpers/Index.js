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
    let buffer = Buffer.from(bytes)
    strRandom+= buffer.toString('base64').replace(/[^a-zA-z0-Z0-9]/g, '').substr(0, size)
  }
  return strRandom
 }

 /**
  *  Move um único arquivo para um caminho especificado, se nenhum for especificado
  *  então "public/uploads" será utilizado
  *
  * @param {FileJar} file o arquivo a ser gerenciado
  * @param {string} path - o caminho para onde o arquivo será enviado
  * @return {Object}
  */

  const manage_single_upload = async (file, path = null) => {

    path = path ? path : Helpers.publicPath('uploads')
    const random_name = await str_random(30)
    let filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

    await file.move(path,{
      name: filename
    })
    return file
  }

  /**
  *  Move multiplos arquivos para um caminho especificado, se nenhum for especificado
  *  então "public/uploads" será utilizado
  *
  * @param {FileJar} file o arquivo a ser gerenciado
  * @param {string} path - o caminho para onde o arquivo será enviado
  * @return {Object}
  */

 const manage_multiple_uploads = async (fileJar, path = null) => {

  path = path ? path : Helpers.publicPath('uploads')
  let successes = [], errors = []

  await Promise.all(fileJar.files.map( async file =>{
    const random_name = await str_random(30)
    let filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

    await file.move(path,{
      name: filename
    })
    if (file.moved){
      successes.push(file)
    }else{
      errors.push(file.error())
    }
  }))
  return {successes, errors}
 }


 module.exports = {
   str_random,
   manage_single_upload,
   manage_multiple_uploads
 }
