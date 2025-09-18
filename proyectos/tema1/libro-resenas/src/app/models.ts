import mongoose from "mongoose";

// Modelo de Usuario
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
});
export const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema);

// Modelo de Libro
const libroSchema = new mongoose.Schema({
  titulo: String,
  autor: String,
  descripcion: String,
  imagen: String,
});
export const Libro = mongoose.models.Libro || mongoose.model("Libro", libroSchema);

// Modelo de Reseña
const reseñaSchema = new mongoose.Schema({
  libroId: { type: mongoose.Schema.Types.ObjectId, ref: "Libro" },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  texto: String,
  fecha: String,
  rating: Number,
  likes: Number,
  dislikes: Number,
});
export const Reseña = mongoose.models.Reseña || mongoose.model("Reseña", reseñaSchema);

// Modelo de Favorito
const favoritoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  libroId: { type: mongoose.Schema.Types.ObjectId, ref: "Libro" },
});
export const Favorito = mongoose.models.Favorito || mongoose.model("Favorito", favoritoSchema);

// Modelo de Voto
const votoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  reseñaId: { type: mongoose.Schema.Types.ObjectId, ref: "Reseña" },
  tipo: { type: String, enum: ["like", "dislike"] },
});
export const Voto = mongoose.models.Voto || mongoose.model("Voto", votoSchema);
