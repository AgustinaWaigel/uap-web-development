
"use server";

import mongoose from "mongoose";
import { connectMongo } from "../lib/mongodb";

const reseñaSchema = new mongoose.Schema({
  libroId: String,
  usuario: String,
  texto: String,
  fecha: String,
  rating: Number,
  likes: Number,
  dislikes: Number,
});

const Reseña = mongoose.models.Reseña || mongoose.model("Reseña", reseñaSchema);

export async function serverActionGuardarReseña(libroId: string, usuario: string, texto: string, rating: number) {
  await connectMongo();
  if (!libroId || !usuario || !texto || rating === undefined || rating === null) {
    throw new Error("Faltan datos requeridos para guardar la reseña");
  }
  const nuevaReseña = new Reseña({
    libroId,
    usuario,
    texto,
    fecha: new Date().toISOString(),
    rating,
    likes: 0,
    dislikes: 0,
  });
  await nuevaReseña.save();
  return await Reseña.find({ libroId });
}

export async function serverActionObtenerReseñas(libroId: string) {
  await connectMongo();
  return await Reseña.find({ libroId });
}

export async function serverActionVotarReseña(libroId: string, reseñaId: string, tipo: 'like' | 'dislike') {
  await connectMongo();
  const reseña = await Reseña.findById(reseñaId);
  if (reseña) {
    if (tipo === 'like') reseña.likes++;
    if (tipo === 'dislike') reseña.dislikes++;
    await reseña.save();
  }
  return await Reseña.find({ libroId });
}