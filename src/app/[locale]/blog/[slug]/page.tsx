import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { blogPosts, getBlogPost } from "@/data/blog";
import { pickLocale } from "@/lib/locale";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog" };
  return { title: post.titleEs };
}

function renderMarkdown(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 mb-4 font-display text-2xl font-semibold">
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-6 mb-3 font-display text-xl font-semibold">
          {line.slice(4)}
        </h3>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="mb-4 text-muted leading-relaxed">
        {line}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getBlogPost(slug);
  if (!post) notFound();

  const content = pickLocale(locale, post.contentEs, post.contentEn);

  return (
    <article className="section-padding">
      <div className="container-page max-w-3xl">
        <Link href="/blog" className="text-sm font-medium text-hielo hover:text-accent">
          ← {pickLocale(locale, "Volver al blog", "Back to blog")}
        </Link>
        <time className="mt-6 block text-xs font-medium uppercase tracking-wider text-oro">
          {new Date(post.date).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES")}
        </time>
        <h1 className="mt-3 font-display text-4xl font-semibold">
          {pickLocale(locale, post.titleEs, post.titleEn)}
        </h1>
        <div className="mt-8">{renderMarkdown(content)}</div>
      </div>
    </article>
  );
}
