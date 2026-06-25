import { Hero } from "@/components/hero";
import { Philosophy } from "@/components/philosophy";
import { BentoGrid } from "@/components/bento-grid";
import { SelectedWork } from "@/components/selected-work";
import { Contact } from "@/components/contact";
import { getDictionary, Locale } from "@/lib/dictionary";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// 1. Thêm hàm này để Next.js biết trước các folder ngôn ngữ cần tạo ra khi build tĩnh
export function generateStaticParams() {
  // Thay đổi mảng này đúng với các locale mà dự án của bạn hỗ trợ (ví dụ: 'vi', 'en')
  return [
    { locale: 'vi' },
    { locale: 'en' }
  ];
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <Hero dict={dict} />
      <main className="relative">
        <Philosophy dict={dict} />
        <BentoGrid dict={dict} />
        <SelectedWork dict={dict} />
        <Contact dict={dict} />
      </main>
    </>
  );
}