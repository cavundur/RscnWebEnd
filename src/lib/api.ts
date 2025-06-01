import axios from "axios";

export interface ReferenceSite {
  id: number;
  slug: string;
  title: string;
  country: string; // 3 harfli ISO kodu
  stars: number;
  link?: string;
}

/**
 * WordPress Reference Sites API'den verileri çeker
 */
export async function fetchReferenceSites(): Promise<ReferenceSite[]> {
  const res = await axios.get("https://cavundur.online/wp-json/wp/v2/reference-sites");
  // API'den dönen veriyi normalize et
  return res.data.map((item: any) => ({
    id: item.id,
    slug: item.slug,
    title: item.title?.rendered || "",
    country: item.acf?.country || "",
    stars: Number(item.acf?.stars_awarded) || 0,
    link: item.acf?.external_link || undefined,
  }));
} 