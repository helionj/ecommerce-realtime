'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with images
 */
const Image = use('App/Models/Image')
const {manage_single_upload} = use('App/Helpers')
const {manage_multiple_uploads} = use('App/Helpers')
const fs = use('fs')

class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, pagination }) {

    try {
      const images = await Image.query()
        .orderBy('id', 'DES')
        .paginate(pagination.page, pagination.limit)
      return response.send(images)
    } catch (error) {
      return response.status(500).send({msg: 'Não foi possível localizar as imagens'})
    }

  }

  /**
   * Render a form to be used for creating a new image.
   * GET images/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {

    try {

      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      })

      if(!fileJar.files){
        const file = await manage_single_upload(fileJar)
        if(file.moved){
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })
          images.push(image)
          return response.status(201).send({successes: images, errors: {}})
        }else{
          return response.status(400).send({msg: 'Não foi possível processar a imagem'})
        }
      }

      let files = await manage_multiple_uploads(fileJar)

      await Promise.all(
        files.successes.map( async file => {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })
          images.push(image)
        })
      )
      return response.status(201).send({successes: images, errors: files.errors})

    } catch (error) {
      return response.status(400).send({msg: 'Não foi possível processar a sua solicitação'})
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {

    const image = await Image.findOrFail(params.id)
    return response.send(image)
  }


  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const image = await Image.findOrFail(params.id)

    try {
      image.merge(request.only(['original_name']))
      await image.save()
      return response.status(200).send(image)

    } catch (error) {
      return response.status(400).send({msg: "Não foi possível atualizar a imagem"})
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {

    const image = await Image.findOrFail(params.id)

    try {

      let filePath = Helpers.publicPath(`uploads/${image.path}`)

      await fs.unlink(filePath, error => {

        if(!error){

          await image.delete()
          return response.status(204).send()
        }
      })

    } catch (error) {
      return status(400).send({msg: "Não foi possível deletar a imagem"})
    }
  }

}
module.exports = ImageController
