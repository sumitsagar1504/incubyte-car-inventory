import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '../../db.js';
import { requireAdmin } from '../auth/auth.js';
import { HttpError } from '../../utils/errors.js';

const vehicleData = z.object({
  make:z.string().trim().min(1).max(80), model:z.string().trim().min(1).max(80),
  category:z.string().trim().min(1).max(80),
  price:z.coerce.number().finite().nonnegative().multipleOf(0.01),
  quantity:z.number().int().nonnegative()
});
const querySchema = z.object({
  make:z.string().optional(),model:z.string().optional(),category:z.string().optional(),
  minPrice:z.coerce.number().nonnegative().optional(),maxPrice:z.coerce.number().nonnegative().optional(),
  page:z.coerce.number().int().positive().default(1),limit:z.coerce.number().int().min(1).max(100).default(12),
  sort:z.enum(['newest','priceAsc','priceDesc','make']).default('newest')
});
const quantitySchema = z.object({quantity:z.number().int().positive().default(1)});
export const vehicleRouter = Router();

async function list(req:import('express').Request,res:import('express').Response) {
  const q = querySchema.parse(req.query);
  if (q.minPrice !== undefined && q.maxPrice !== undefined && q.minPrice > q.maxPrice) throw new HttpError(400,'Minimum price exceeds maximum price');
  const where:Prisma.VehicleWhereInput = {
    ...(q.make && {make:{contains:q.make,mode:'insensitive'}}),
    ...(q.model && {model:{contains:q.model,mode:'insensitive'}}),
    ...(q.category && {category:{contains:q.category,mode:'insensitive'}}),
    ...((q.minPrice !== undefined || q.maxPrice !== undefined) && {price:{...(q.minPrice !== undefined && {gte:q.minPrice}),...(q.maxPrice !== undefined && {lte:q.maxPrice})}})
  };
  const orderBy:Prisma.VehicleOrderByWithRelationInput = q.sort==='priceAsc'?{price:'asc'}:q.sort==='priceDesc'?{price:'desc'}:q.sort==='make'?{make:'asc'}:{createdAt:'desc'};
  const [items,total] = await db.$transaction([db.vehicle.findMany({where,orderBy,skip:(q.page-1)*q.limit,take:q.limit}),db.vehicle.count({where})]);
  res.json({items:items.map(serialize),total,page:q.page,limit:q.limit});
}
vehicleRouter.get('/',list);
vehicleRouter.get('/search',list);
vehicleRouter.post('/',async(req,res)=>{
  const data=vehicleData.parse(req.body);
  const vehicle=await db.vehicle.create({data:{...data,price:new Prisma.Decimal(data.price)}});
  res.status(201).json(serialize(vehicle));
});
vehicleRouter.put('/:id',async(req,res)=>{
  const data=vehicleData.partial().refine(v=>Object.keys(v).length>0).parse(req.body);
  const vehicle=await db.vehicle.update({where:{id:String(req.params.id)},data:{...data,...(data.price!==undefined && {price:new Prisma.Decimal(data.price)})}}).catch(notFound);
  res.json(serialize(vehicle));
});
vehicleRouter.delete('/:id',requireAdmin,async(req,res)=>{
  await db.vehicle.delete({where:{id:String(req.params.id)}}).catch(notFound);
  res.status(204).end();
});
vehicleRouter.post('/:id/purchase',async(req,res)=>{
  const {quantity}=quantitySchema.parse(req.body ?? {});
  const result=await db.vehicle.updateMany({where:{id:String(req.params.id),quantity:{gte:quantity}},data:{quantity:{decrement:quantity}}});
  if (!result.count) {
    const exists=await db.vehicle.findUnique({where:{id:String(req.params.id)},select:{id:true}});
    throw new HttpError(exists?409:404,exists?'Insufficient stock':'Vehicle not found');
  }
  const vehicle=await db.vehicle.findUniqueOrThrow({where:{id:String(req.params.id)}});
  res.json(serialize(vehicle));
});
vehicleRouter.post('/:id/restock',requireAdmin,async(req,res)=>{
  const {quantity}=quantitySchema.parse(req.body);
  const vehicle=await db.vehicle.update({where:{id:String(req.params.id)},data:{quantity:{increment:quantity}}}).catch(notFound);
  res.json(serialize(vehicle));
});

function notFound(error:unknown):never {
  if ((error as {code?:string}).code==='P2025') throw new HttpError(404,'Vehicle not found');
  throw error;
}
function serialize(vehicle:{price:Prisma.Decimal;[key:string]:unknown}) {return {...vehicle,price:vehicle.price.toString()};}
