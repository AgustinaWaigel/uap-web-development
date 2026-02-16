// tests/serverActions.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { serverActionGuardarReseña, serverActionVotarReseña } from "../src/app/book/serverActionGuardarReseña";

vi.mock("fs", () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
}));

const fakeResenas: any = {
  "book1": [
    { id: "r1", usuario: "Anon", texto: "Bien", fecha: "2024-01-01", rating: 4, likes: 1, dislikes: 0 },
  ],
};

describe("server actions reseñas", () => {
  beforeEach(async () => {
    // reset mocks
    vi.mocked((await import("fs")).promises.readFile).mockResolvedValue(JSON.stringify(fakeResenas));
    vi.mocked((await import("fs")).promises.writeFile).mockResolvedValue();
  });

  it("guarda una reseña nueva", async () => {
    const result = await serverActionGuardarReseña("book2", "Anon", "Excelente", 5);
    expect(result).toHaveLength(1);
    expect(result[0].texto).toBe("Excelente");
    expect(result[0].likes).toBe(0);
  });

  it("vota like en reseña existente", async () => {
    const result = await serverActionVotarReseña("book1", "r1", "like");
    expect(result[0].likes).toBe(2);
  });

  it("ignora votar si reseña no existe", async () => {
    const result = await serverActionVotarReseña("book1", "fake", "like");
    expect(result[0].likes).toBe(1); // no cambió
  });
});
