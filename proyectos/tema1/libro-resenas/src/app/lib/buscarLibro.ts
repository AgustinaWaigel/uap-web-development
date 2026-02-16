"use server";

export async function buscarLibros(_prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  if (!query) return [];
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.items || [];
}