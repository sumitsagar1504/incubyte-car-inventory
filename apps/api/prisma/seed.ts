import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const db=new PrismaClient();
const vehicles=[
  {make:'Porsche',model:'911 Carrera',category:'Coupe',price:121000,quantity:3,images:['/images/vehicles/porsche-911-carrera.jpg','/images/vehicles/porsche-911-carrera-angle.jpg']},
  {make:'Mercedes-Benz',model:'E-Class',category:'Sedan',price:64900,quantity:5,images:['/images/vehicles/mercedes-benz-e-class.jpg','/images/vehicles/mercedes-benz-e-class-front.jpg']},
  {make:'Land Rover',model:'Defender 110',category:'SUV',price:60900,quantity:4,images:['/images/vehicles/land-rover-defender-110.jpg','/images/vehicles/land-rover-defender-110-rear.jpg']},
  {make:'BMW',model:'i4',category:'Electric',price:52900,quantity:2,images:['/images/vehicles/bmw-i4.jpg','/images/vehicles/bmw-i4-rear.jpg']},
  {make:'Audi',model:'Q8',category:'SUV',price:74400,quantity:3,images:['/images/vehicles/audi-q8.jpg','/images/vehicles/audi-q8-rear.jpg']},
  {make:'Volvo',model:'XC90',category:'SUV',price:58500,quantity:0,images:['/images/vehicles/volvo-xc90.jpg','/images/vehicles/volvo-xc90-rear.jpg']}
];
async function main(){
  if(process.env.NODE_ENV==='production' && process.env.ALLOW_PRODUCTION_SEED!=='true') throw new Error('Production seed requires ALLOW_PRODUCTION_SEED=true');
  if(await db.vehicle.count()===0) await db.vehicle.createMany({data:vehicles});
  for(const sample of vehicles){
    const current=await db.vehicle.findFirst({where:{make:sample.make,model:sample.model}});
    if(current && current.images.length===0) await db.vehicle.update({where:{id:current.id},data:{images:sample.images,description:current.description ?? 'Demonstration listing. Photos show the model, not the specific vehicle. Confirm year, mileage and equipment with the dealership.'}});
  }
  if(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD){
    if(process.env.ADMIN_PASSWORD.length<12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');
    const email=process.env.ADMIN_EMAIL.trim().toLowerCase();
    const passwordHash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
    const existing=await db.user.findUnique({where:{email}});
    if(existing && existing.role!=='ADMIN') throw new Error('ADMIN_EMAIL belongs to a customer account; choose a different address');
    if(!existing) await db.user.create({data:{name:'Administrator',email,passwordHash,role:'ADMIN',emailVerifiedAt:new Date()}});
  }
}
main().finally(()=>db.$disconnect());
