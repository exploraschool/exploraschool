import { blogSectionPageParams } from "@/lib/blog-catalog";

export { default, generateMetadata } from "../page";

export const revalidate = 3600;

export function generateStaticParams() {
  return blogSectionPageParams("products");
}
