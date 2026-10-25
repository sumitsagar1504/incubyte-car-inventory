const auth=[{bearerAuth:[]}];
const id=[{in:'path',name:'id',required:true,schema:{type:'string'}}];
export const openapi={
  openapi:'3.0.3',info:{title:'Incubyte Car Inventory API',version:'2.0.0'},servers:[{url:'/'}],
  components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer',bearerFormat:'JWT'}},schemas:{
    Vehicle:{type:'object',properties:{id:{type:'string'},make:{type:'string'},model:{type:'string'},category:{type:'string'},price:{type:'string'},quantity:{type:'integer'},year:{type:'integer',nullable:true},mileage:{type:'integer',nullable:true},fuelType:{type:'string',nullable:true},transmission:{type:'string',nullable:true},description:{type:'string',nullable:true},features:{type:'array',items:{type:'string'}},images:{type:'array',items:{type:'string'}}}},
    Reservation:{type:'object',properties:{id:{type:'string'},vehicleId:{type:'string'},userId:{type:'string'},status:{type:'string',enum:['PENDING','CANCELLED']},priceSnapshot:{type:'string'},vehicle:{$ref:'#/components/schemas/Vehicle'}}}
  }},
  paths:{
    '/api/health':{get:{responses:{'200':{description:'Healthy'}}}},
    '/api/auth/capabilities':{get:{responses:{'200':{description:'Email availability'}}}},
    '/api/auth/register':{post:{summary:'Create a customer account',responses:{'201':{description:'Registered'},'409':{description:'Email already registered'}}}},
    '/api/auth/login':{post:{summary:'Sign in',responses:{'200':{description:'JWT and user'}}}},
    '/api/auth/me':{get:{security:auth,responses:{'200':{description:'Current account'}}}},
    '/api/auth/password-reset/request':{post:{summary:'Request a single-use reset link',responses:{'200':{description:'Request accepted'},'503':{description:'Email provider not configured'}}}},
    '/api/auth/password-reset/confirm':{post:{summary:'Reset password using token',responses:{'200':{description:'Password updated'}}}},
    '/api/auth/verify/request':{post:{security:auth,summary:'Resend email verification link',responses:{'200':{description:'Request accepted'}}}},
    '/api/auth/verify/confirm':{post:{summary:'Verify email using token',responses:{'200':{description:'Email verified'}}}},
    '/api/vehicles':{get:{summary:'Public inventory',parameters:['make','model','category','minPrice','maxPrice','inStock','page','limit','sort'].map(name=>({in:'query',name,schema:{type:'string'}})),responses:{'200':{description:'Paginated vehicles'}}},post:{security:auth,summary:'Create vehicle',responses:{'201':{description:'Created'}}}},
    '/api/vehicles/search':{get:{summary:'Public search alias',responses:{'200':{description:'Search results'}}}},
    '/api/vehicles/{id}':{get:{parameters:id,responses:{'200':{description:'Vehicle details'},'404':{description:'Not found'}}},put:{security:auth,parameters:id,responses:{'200':{description:'Updated'}}},delete:{security:auth,parameters:id,summary:'Admin only',responses:{'204':{description:'Deleted'},'409':{description:'Reservation history exists'}}}},
    '/api/vehicles/{id}/purchase':{post:{security:auth,parameters:id,summary:'Legacy kata inventory decrement',responses:{'200':{description:'Updated'},'409':{description:'Insufficient stock'}}}},
    '/api/vehicles/{id}/restock':{post:{security:auth,parameters:id,summary:'Admin only',responses:{'200':{description:'Updated'}}}},
    '/api/reservations':{get:{security:auth,summary:'My reservations',responses:{'200':{description:'Reservations'}}},post:{security:auth,summary:'Hold one unit in inventory',responses:{'201':{description:'Created'},'409':{description:'Out of stock'}}}},
    '/api/reservations/admin':{get:{security:auth,summary:'Admin reservations',responses:{'200':{description:'Most recent 100 reservations'}}}},
    '/api/reservations/{id}':{get:{security:auth,parameters:id,responses:{'200':{description:'My reservation'}}}},
    '/api/reservations/{id}/cancel':{post:{security:auth,parameters:id,responses:{'200':{description:'Cancelled and stock restored'}}}}
  }
};
