"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import {
  serverActionObtenerReseñas,
  serverActionGuardarReseña,
  serverActionVotarReseña,
  Reseña
} from "../serverActionGuardarReseña";

// 🔹 Next 15 puede pasar params como objeto o como Promise
export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resenas, setResenas] = useState<Reseña[]>([]);

  // Resolver params (siempre es Promise en Next.js 15)
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Cargar datos del libro y reseñas
  useEffect(() => {
    if (!resolvedParams) return;
    const { id } = resolvedParams;

    fetch(`https://www.googleapis.com/books/v1/volumes/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    (async () => {
      const reseñas = await serverActionObtenerReseñas(id);
      setResenas(reseñas);
    })();
  }, [resolvedParams]);

  if (!resolvedParams) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-pink-500 animate-pulse bg-amber-50">
        <p className="text-xl font-semibold">Cargando parámetros...</p>
      </div>
    );
  }

  const { id } = resolvedParams;

  const formAction = async (formData: FormData) => {
    const usuario = "Anónimo";
    const texto = formData.get("review") as string;
    const rating = Number(formData.get("rating"));
    const nuevasResenas = await serverActionGuardarReseña(id, usuario, texto, rating);
    setResenas(nuevasResenas);
  };

  const votar = async (reseñaId: string, tipo: "like" | "dislike") => {
    const votos = JSON.parse(localStorage.getItem("votosResenas") || "{}");
    if (votos[reseñaId]) {
      alert("Ya votaste esta reseña.");
      return;
    }
    const nuevasResenas = await serverActionVotarReseña(id, reseñaId, tipo);
    setResenas(nuevasResenas);
    votos[reseñaId] = tipo;
    localStorage.setItem("votosResenas", JSON.stringify(votos));
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-pink-500 animate-pulse bg-amber-50">
        <svg
          className="animate-spin h-12 w-12 mb-4 text-pink-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        <p className="text-xl font-semibold">Cargando libro...</p>
      </div>
    );

  if (!book) return notFound();

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gradient-to-br from-pink-100 via-white to-pink-200">
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
        {book.volumeInfo.imageLinks?.thumbnail && (
          <img
            src={book.volumeInfo.imageLinks.thumbnail}
            alt={book.volumeInfo.title}
            className="w-40 h-60 object-cover rounded-lg shadow border border-gray-200"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2 leading-tight">
            {book.volumeInfo.title}
          </h1>
          {book.volumeInfo.authors && (
            <p className="text-lg text-gray-700 mb-1 font-medium">
              {book.volumeInfo.authors.join(", ")}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
            {book.volumeInfo.publishedDate && (
              <span className="bg-gray-100 rounded px-2 py-1">
                Año: {book.volumeInfo.publishedDate}
              </span>
            )}
            {book.volumeInfo.pageCount && (
              <span className="bg-gray-100 rounded px-2 py-1">
                Páginas: {book.volumeInfo.pageCount}
              </span>
            )}
            {book.volumeInfo.categories && (
              <span className="bg-gray-100 rounded px-2 py-1">
                {book.volumeInfo.categories.join(" | ")}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="mb-6 text-gray-800 text-base leading-relaxed">
        {book.volumeInfo.description}
      </p>
      <form
        action={async (formData) => {
          await formAction(formData);
        }}
        className="bg-gray-50 rounded-lg shadow p-4 mb-8 border border-gray-200"
      >
        <div className="mb-4 text-gray-400">
          <label className="block font-semibold mb-1">Calificación:</label>
          <select name="rating" required className="border rounded px-2 py-1">
            <option value="1">1 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="5">5 ⭐</option>
          </select>
        </div>
        <div className="mb-4 text-gray-400">
          <label className="block font-semibold mb-1">Reseña:</label>
          <textarea
            name="review"
            required
            maxLength={300}
            className="border rounded px-2 py-1 w-full min-h-[60px]"
          />
          <span className="text-xs text-gray-600">Máx. 300 caracteres</span>
        </div>
        <button
          type="submit"
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition"
        >
          Enviar
        </button>
      </form>
      <h4 className="text-lg font-bold mb-4">Reseñas:</h4>
      {resenas.length === 0 ? (
        <p className="text-gray-500 italic">
          Sé el primero en dejar una reseña.
        </p>
      ) : (
        <ul className="space-y-6">
          {[...resenas]
            .sort(
              (a, b) => b.likes - b.dislikes - (a.likes - a.dislikes)
            )
            .map((r, i, arr) => {
              const isBest = i === 0 && arr.length > 1;
              return (
                <li
                  key={r.id}
                  className={`relative bg-white rounded-xl shadow p-6 border-2 flex flex-col sm:flex-row sm:items-center justify-between transition-all ${
                    isBest
                      ? "border-yellow-400 ring-2 ring-yellow-200"
                      : "border-gray-200"
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-3 left-3 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded shadow">
                      Mejor reseña
                    </span>
                  )}
                  <div className="mb-2 sm:mb-0 flex items-center gap-2">
                    <span className="font-bold text-yellow-600 text-lg">
                      {Array.from({ length: r.rating }).map((_, idx) => (
                        <span key={idx}>⭐</span>
                      ))}
                    </span>
                    <span className="ml-3 text-gray-800 text-base">
                      {r.texto}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => votar(r.id, "like")}
                      className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full hover:bg-green-200 text-green-700 text-xl font-bold shadow-sm border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
                      aria-label="Me gusta"
                      disabled={
                        typeof window !== "undefined" &&
                        JSON.parse(
                          localStorage.getItem("votosResenas") || "{}"
                        )[r.id]
                      }
                    >
                      👍
                    </button>
                    <span className="inline-block min-w-[2.5rem] text-center bg-green-600 text-white rounded-full px-2 py-1 text-sm font-semibold shadow">
                      {r.likes}
                    </span>
                    <button
                      type="button"
                      onClick={() => votar(r.id, "dislike")}
                      className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full hover:bg-red-200 text-red-700 text-xl font-bold shadow-sm border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                      aria-label="No me gusta"
                      disabled={
                        typeof window !== "undefined" &&
                        JSON.parse(
                          localStorage.getItem("votosResenas") || "{}"
                        )[r.id]
                      }
                    >
                      👎
                    </button>
                    <span className="inline-block min-w-[2.5rem] text-center bg-red-600 text-white rounded-full px-2 py-1 text-sm font-semibold shadow">
                      {r.dislikes}
                    </span>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
