import { Hero } from "@/components/hero";
import { CVContainer } from "@/components/CVContainer";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ProjectSection } from "@/components/ProjectSection";
import { SkillsSection } from "@/components/SkillsSection";
import { EducationTimeline } from "@/components/EducationTimeline";
import { Contact } from "@/components/contact";
import { StickyNav } from "@/components/StickyNav";
import { BackToTop } from "@/components/BackToTop";
import { Snowfall } from "@/components/xmas/Snowfall";
import { CommandPalette } from "@/components/CommandPalette";
import { ConsoleGreeting } from "@/components/ConsoleGreeting";

const CV_URL =
  "https://drive.google.com/file/d/1egQmUjWM_flHn63QUhG-fAY9P00OGgOd/view?usp=sharing";
import { getDictionary, Locale } from "@/lib/dictionary";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Only /en and /vi exist; any other first segment (e.g. /fr) is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "vi" }, { locale: "en" }];
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      {/* ── Holiday snow: first in DOM so all content paints above it ── */}
      <Snowfall />

      {/* ── Persistent floating UI (outside scroll containers) ── */}
      <StickyNav dict={dict} />
      <BackToTop />
      <CommandPalette dict={dict} />
      <ConsoleGreeting email={dict.footer.email} cvUrl={CV_URL} />

      {/* ── Entry Phase: 3D Hero (full viewport) ── */}
      <Hero dict={dict} />

      {/* ── The Living CV: glassmorphic CV sheet ── */}
      <main className="relative bg-neutral-50/50 dark:bg-neutral-950/50 bg-grid-overlay min-h-screen">
        <CVContainer>
          {/* 1. Work Experience with expandable mini-dashboard */}
          <ExperienceCard dict={dict} />

          {/* 2. Projects with unique interactive visualizations */}
          {/* <ProjectSection dict={dict} /> */}

          {/* 3. Skills: grouped grid + optional lazy 3D orbit */}
          <SkillsSection dict={dict} />

          {/* 4. Education with scroll-triggered timeline */}
          <EducationTimeline dict={dict} />
        </CVContainer>

        {/* 5. Contact footer (outside the CV sheet, full width) */}
        <Contact dict={dict} />
      </main>
    </>
  );
}