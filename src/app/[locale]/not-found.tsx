import { NotFoundView } from "@/components/NotFoundView";

export default function LocaleNotFound() {
  // Header already shows the brand — keep the page focused.
  return <NotFoundView showBrand={false} />;
}
