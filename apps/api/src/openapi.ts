export const openapi = {
  openapi:'3.0.3',info:{title:'Incubyte Car Inventory API',version:'1.0.0'},
  servers:[{url:'/'}],
  components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer',bearerFormat:'JWT'}},schemas:{Vehicle:{type:'object',properties:{id:{type:'string'},make:{type:'string'},model:{type:'string'},category:{type:'string'},price:{type:'string'},quantity:{type:'integer'}}}}},
  security:[{bearerAuth:[]}],
  paths:{
    '/api/health':{get:{security:[],responses:{'200':{description:'Healthy'}}}},
    '/api/auth/register':{post:{security:[],requestBody:{content:{'application/json':{schema:{type:'object',required:['name','email','password'],properties:{name:{type:'string'},email:{type:'string',format:'email'},password:{type:'string',minLength:8}}}}}},responses:{'201':{description:'Registered'}}}},
    '/api/auth/login':{post:{security:[],requestBody:{content:{'application/json':{schema:{type:'object',required:['email','password'],properties:{email:{type:'string'},password:{type:'string'}}}}}},responses:{'200':{description:'JWT and user'}}}},
    '/api/vehicles':{get:{parameters:[{in:'query',name:'page',schema:{type:'integer'}},{in:'query',name:'limit',schema:{type:'integer'}},{in:'query',name:'sort',schema:{type:'string'}}],responses:{'200':{description:'Paginated vehicles'}}},post:{requestBody:{content:{'application/json':{schema:{$ref:'#/components/schemas/Vehicle'}}}},responses:{'201':{description:'Created'}}}},
    '/api/vehicles/search':{get:{parameters:['make','model','category','minPrice','maxPrice'].map(name=>({in:'query',name,schema:{type:name.includes('Price')?'number':'string'}})),responses:{'200':{description:'Search results'}}}},
    '/api/vehicles/{id}':{put:{parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}}],responses:{'200':{description:'Updated'}}},delete:{parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}}],responses:{'204':{description:'Deleted by admin'}}}},
    '/api/vehicles/{id}/purchase':{post:{description:'Quantity defaults to one.',parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}}],requestBody:{content:{'application/json':{schema:{type:'object',properties:{quantity:{type:'integer',minimum:1,default:1}}}}}},responses:{'200':{description:'Updated vehicle'},'409':{description:'Insufficient stock'}}}},
    '/api/vehicles/{id}/restock':{post:{description:'Admin only.',parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}}],requestBody:{required:true,content:{'application/json':{schema:{type:'object',required:['quantity'],properties:{quantity:{type:'integer',minimum:1}}}}}},responses:{'200':{description:'Updated vehicle'}}}}
  }
};
