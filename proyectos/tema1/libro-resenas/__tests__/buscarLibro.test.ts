// tests/buscarLibro.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { buscarLibros } from "../src/app/lib/buscarLibro";

describe("buscarLibros", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("devuelve [] si query está vacío", async () => {
    const result = await buscarLibros(null, new FormData());
    expect(result).toEqual([]);
  });

  it("devuelve lista de libros cuando API responde", async () => {
    const fakeData = { items: [{ id: "1", volumeInfo: { title: "Test" } }] };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeData,
    }) as any;

    const formData = new FormData();
    formData.set("query", "harry potter");

    const result = await buscarLibros(null, formData);
    expect(result).toEqual(fakeData.items);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("harry%20potter")
    );
  });

  it("devuelve [] si la API no trae items", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    const formData = new FormData();
    formData.set("query", "nada");

    const result = await buscarLibros(null, formData);
    expect(result).toEqual([]);
  });

  it("lanza error si fetch falla", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network error"));

    const formData = new FormData();
    formData.set("query", "algo");

    await expect(buscarLibros(null, formData)).rejects.toThrow("network error");
  });
});
