import type { Category } from "@/types";
import { endpoints } from "./endpoints";
import { remoteGet } from "./remote";
import { categoryFromDTO } from "./mappers";
import { demoCategories } from "./demo/service";
import { source } from "./source";
import type { CategoryDTO } from "./types";

export const getCategories = (): Promise<Category[]> =>
  source(demoCategories, async () => (await remoteGet<CategoryDTO[]>(endpoints.categories)).data.map(categoryFromDTO));

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}
