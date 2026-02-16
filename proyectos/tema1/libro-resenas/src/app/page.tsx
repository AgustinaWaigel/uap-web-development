'use client';
import { useActionState } from "react";
import { buscarLibros } from "./lib/buscarLibro";
import Link from "next/link";

export const dynamic = "force-dynamic";
interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

export default function Page() {
  const [libros, formAction, pending] = useActionState<GoogleBook[], FormData>(buscarLibros, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-pink-100 via-white to-pink-200 py-8 px-2">
      <div className="w-full max-w-3xl bg-white/80 rounded-2xl shadow-xl p-8 mb-10 border border-pink-200">
        <h1 className="text-4xl font-extrabold mb-6 text-pink-800 text-center drop-shadow">Busca un libro</h1>
        <form action={formAction} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto">
          <input
            name="query"
            type="text"
            placeholder="Buscar por título, autor o ISBN..."
            className="border-2 border-pink-200 rounded-lg px-4 py-2 flex-1 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg focus:text-gray-600 bg-white/90 placeholder-gray-400"
            autoFocus
            autoComplete="on"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-pink-500 to-pink-700 text-white px-6 py-2 rounded-lg font-bold shadow hover:from-pink-600 hover:to-pink-800 transition-all text-lg disabled:opacity-60"
            disabled={pending}
          >{pending ? 'Buscando...' : 'Buscar'}</button>
        </form>
      </div>
      <div className="w-full max-w-4xl min-h-[200px]">
        {pending ? (
          <div className="flex flex-col items-center justify-center mt-16 text-pink-400 animate-pulse">
            <svg className="animate-spin h-12 w-12 mb-4 text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-xl font-medium">Buscando libros...</p>
          </div>
        ) : libros.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-gray-400">
            <span className="text-6xl mb-4">🔍</span>
            <p className="text-xl font-medium">No hay resultados.</p>
          </div>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {libros.map((libro) => (
              <li key={libro.id} className="bg-white/90 rounded-2xl shadow-lg p-5 border-2 border-pink-100 flex flex-col h-full hover:scale-[1.03] hover:shadow-2xl transition-transform">
                <div className="flex flex-col items-center gap-3 mb-3">
                  {libro.volumeInfo.imageLinks?.thumbnail ? (
                    <img
                      src={libro.volumeInfo.imageLinks.thumbnail}
                      alt={libro.volumeInfo.title}
                      className="w-28 h-40 object-cover rounded-lg border border-pink-200 shadow"
                    />
                  ) : (
                    <div className="w-28 h-40 flex items-center justify-center bg-pink-50 rounded-lg border border-pink-100 text-4xl text-pink-200">?</div>
                  )}
                  <h2 className="text-lg font-bold text-pink-800 text-center leading-tight line-clamp-2">{libro.volumeInfo.title}</h2>
                  {libro.volumeInfo.authors && (
                    <p className="text-sm text-gray-600 text-center mb-1">{libro.volumeInfo.authors.join(", ")}</p>
                  )}
                </div>
                <p className="text-sm text-gray-700 line-clamp-3 mb-3 flex-1">{libro.volumeInfo.description}</p>
                <Link
                  href={`/book/${libro.id}`}
                  className="inline-block mt-auto bg-pink-100 text-pink-700 px-4 py-2 rounded-lg hover:bg-pink-200 transition text-sm font-semibold shadow"
                >Ver detalles</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
