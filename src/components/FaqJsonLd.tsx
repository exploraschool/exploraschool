type FaqJsonLdProps = {
  items: { question: string; answer: string }[];
};

export function FaqJsonLd({ items }: FaqJsonLdProps) {
  const valid = items.filter((item) => item.question.trim() && item.answer.trim());
  if (valid.length < 1) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
