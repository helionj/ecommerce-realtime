'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(()=>{

  /**
   * Client resource products route
   */
  Route.get('products', 'ProductController.index').apiOnly()
  Route.get('product/:id', 'ProductController.show').apiOnly()


  /**
   * Client resource orders route
   */
  Route.get('orders', 'OrderController.index').apiOnly()
  Route.get('orders/id:', 'OrderController.show').apiOnly()
  Route.post('orders', 'OrderController.store').apiOnly()
  Route.put('orders/id:', 'OrderController.put').apiOnly()

}).prefix('v1').namespace('Client')
