import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import { PageWrapper, AnimatedSection } from "@/components/shared/Wrappers";
import { QuizCardPreview } from "@/components/shared/Cards";
import { PrimaryButton } from "@/components/shared/Buttons";
import { ArrowRight, Bot } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <PageWrapper className="flex flex-col w-full bg-white">
      <Hero />
      <Features />
      
      {/* AI Teacher Section */}
      <section id="tutor" className="py-24 relative overflow-hidden bg-gray-50 border-t border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimatedSection direction="right" className="flex-1 w-full relative">
              <div className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-md aspect-video flex flex-col items-center justify-center text-center">
                <Bot className="w-20 h-20 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Hello! I'm your AI Tutor.</h3>
                <p className="text-gray-600">I'm analyzing your learning patterns to generate your next lesson...</p>
                
                {/* Mock processing animation */}
                <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection direction="left" className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Personalized Learning, Redefined.</h2>
              <p className="text-lg text-gray-600">
                Our AI doesn't just give answers. It guides you through the problem-solving process, adapting its teaching style to match how you learn best. Whether you're a visual learner or prefer step-by-step logic, the AI adjusts instantly.
              </p>
              <ul className="space-y-4 pt-4">
                {["Explains concepts at your level", "Available 24/7 for doubt clearing", "Generates custom practice problems"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                    <span className="font-medium text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Gamified Section */}
      <section id="gamified" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">Learn & Earn</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Flip the cards to test your knowledge. Complete daily streaks, top the leaderboard, and unlock cool badges. Learning has never been this rewarding.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimatedSection delay={0.1}>
              <QuizCardPreview question="What is the powerhouse of the cell?" answer="Mitochondria" />
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <QuizCardPreview question="Solve: 2x + 5 = 15" answer="x = 5" />
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <QuizCardPreview question="What is Newton's Third Law?" answer="Every action has an equal and opposite reaction." />
            </AnimatedSection>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gray-50 border-t border-gray-100">
        <AnimatedSection direction="up" className="container mx-auto px-4 text-center relative z-10">
          <div className="bg-white max-w-4xl mx-auto rounded-3xl p-12 border border-gray-200 shadow-xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">Ready to Level Up?</h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of students who are mastering their subjects with the power of AI.
            </p>
            <Link href="/signup">
              <PrimaryButton size="lg" className="h-14 px-10 text-xl rounded-full" icon={<ArrowRight className="w-6 h-6" />}>
                Create Your Free Account
              </PrimaryButton>
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </PageWrapper>
  );
}
