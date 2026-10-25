import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../db.js';
import { emailEnabled } from '../../config/env.js';
import { requireAdmin, type AuthRequest } from '../auth/auth.js';
import { HttpError } from '../../utils/errors.js';

export const reservationRouter=Router();
const reservationInput=z.object({vehicleId:z.uuid()});

function serialize(reservation:{priceSnapshot:{toString():string};vehicle:{price:{toString():string};[key:string]:unknown};[key:string]:unknown}) {
  return {...reservation,priceSnapshot:reservation.priceSnapshot.toString(),vehicle:{...reservation.vehicle,price:reservation.vehicle.price.toString()}};
}

reservationRouter.get('/',async(req:AuthRequest,res)=>{
  const reservations=await db.reservation.findMany({where:{userId:req.auth!.id},include:{vehicle:true},orderBy:{createdAt:'desc'}});
  res.json({items:reservations.map(serialize)});
});

reservationRouter.get('/admin',requireAdmin,async(_req,res)=>{
  const reservations=await db.reservation.findMany({include:{vehicle:true,user:{select:{id:true,name:true,email:true}}},orderBy:{createdAt:'desc'},take:100});
  res.json({items:reservations.map(serialize)});
});

reservationRouter.get('/:id',async(req:AuthRequest,res)=>{
  const reservation=await db.reservation.findFirst({where:{id:String(req.params.id),userId:req.auth!.id},include:{vehicle:true}});
  if(!reservation) throw new HttpError(404,'Reservation not found');
  res.json(serialize(reservation));
});

reservationRouter.post('/',async(req:AuthRequest,res)=>{
  const {vehicleId}=reservationInput.parse(req.body);
  if(emailEnabled && !req.auth!.emailVerified) throw new HttpError(403,'Verify your email before reserving a vehicle');
  const reservation=await db.$transaction(async tx=>{
    const updated=await tx.vehicle.updateMany({where:{id:vehicleId,quantity:{gte:1}},data:{quantity:{decrement:1}}});
    if(!updated.count){
      const exists=await tx.vehicle.findUnique({where:{id:vehicleId},select:{id:true}});
      throw new HttpError(exists?409:404,exists?'Vehicle is out of stock':'Vehicle not found');
    }
    const vehicle=await tx.vehicle.findUniqueOrThrow({where:{id:vehicleId}});
    return tx.reservation.create({data:{userId:req.auth!.id,vehicleId,priceSnapshot:vehicle.price},include:{vehicle:true}});
  });
  res.status(201).json(serialize(reservation));
});

reservationRouter.post('/:id/cancel',async(req:AuthRequest,res)=>{
  const reservation=await db.$transaction(async tx=>{
    const existing=await tx.reservation.findFirst({where:{id:String(req.params.id),userId:req.auth!.id}});
    if(!existing) throw new HttpError(404,'Reservation not found');
    const claimed=await tx.reservation.updateMany({where:{id:existing.id,status:'PENDING'},data:{status:'CANCELLED'}});
    if(!claimed.count) throw new HttpError(409,'Reservation is already cancelled');
    await tx.vehicle.update({where:{id:existing.vehicleId},data:{quantity:{increment:1}}});
    return tx.reservation.findUniqueOrThrow({where:{id:existing.id},include:{vehicle:true}});
  });
  res.json(serialize(reservation));
});
