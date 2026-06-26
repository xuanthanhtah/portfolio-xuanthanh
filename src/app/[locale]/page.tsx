import { Hero } from "@/components/hero";
import { CVContainer } from "@/components/CVContainer";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ProjectSection } from "@/components/ProjectSection";
import { SkillsCloud } from "@/components/SkillsCloud";
import { EducationTimeline } from "@/components/EducationTimeline";
import { Contact } from "@/components/contact";
import { getDictionary, Locale } from "@/lib/dictionary";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "vi" }, { locale: "en" }];
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      {/* ── Entry Phase: 3D Hero (full viewport) ── */}
      <Hero dict={dict} />

      {/* ── The Living CV: glassmorphic CV sheet ── */}
      <main className="relative bg-neutral-50/50 dark:bg-neutral-950/50 bg-grid-overlay min-h-screen">
        <CVContainer>
          {/* 1. Work Experience with expandable mini-dashboard */}
          <ExperienceCard dict={dict} />

          {/* 2. Projects with unique interactive visualizations */}
          {/* <ProjectSection dict={dict} /> */}

          {/* 3. Skills with hover-reveal proficiency cards */}
          <SkillsCloud dict={dict} />

          {/* 4. Education with scroll-triggered timeline */}
          <EducationTimeline dict={dict} />
        </CVContainer>

        {/* 5. Contact footer (outside the CV sheet, full width) */}
        <Contact dict={dict} />
      </main>
    </>
  );
}