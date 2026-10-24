import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const db=new PrismaClient();
const vehicles=[
  {make:'Porsche',model:'911 Carrera',category:'Coupe',price:121000,quantity:3},
  {make:'Mercedes-Benz',model:'E-Class',category:'Sedan',price:64900,quantity:5},
  {make:'Land Rover',model:'Defender 110',category:'SUV',price:60900,quantity:4},
  {make:'BMW',model:'i4',category:'Electric',price:52900,quantity:2},
  {make:'Audi',model:'Q8',category:'SUV',price:74400,quantity:3},
  {make:'Volvo',model:'XC90',category:'SUV',price:58500,quantity:0}
];
async function main(){
  if(process.env.NODE_ENV==='production' && process.env.ALLOW_PRODUCTION_SEED!=='true') throw new Error('Production seed requires ALLOW_PRODUCTION_SEED=true');
  if(await db.vehicle.count()===0) await db.vehicle.createMany({data:vehicles});
  if(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD){
    if(process.env.ADMIN_PASSWORD.length<12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');
    const email=process.env.ADMIN_EMAIL.trim().toLowerCase();
    const passwordHash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
    await db.user.upsert({where:{email},create:{name:'Administrator',email,passwordHash,role:'ADMIN'},update:{role:'ADMIN'}});
  }
}
main().finally(()=>db.$disconnect());
