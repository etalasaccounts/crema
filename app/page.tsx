"use client";

import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NavbarTop } from "./navbar";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import AnimatedGradientBackground from "@/components/magicui/animated-gradient-background";
import { Suspense, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function FAQItems() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "How do I start recording my screen with Screenbolt?",
      answer:
        "Simply click the record button and select what you want to capture. Screenbolt works instantly in your browser—no downloads or installations required.",
    },
    {
      question: "Can I record audio along with my screen recording?",
      answer:
        "Yes! Screenbolt captures both your screen and audio simultaneously. You can record system audio, microphone input, or both depending on your needs.",
    },
    {
      question: "How do I share my recordings after creating them?",
      answer:
        "Once your recording is complete, you'll get a secure shareable link instantly. You can also download the video file or integrate with your favorite tools.",
    },
    {
      question: "Is Screenbolt free to use?",
      answer:
        "We offer a free tier with basic recording features. For advanced features like longer recordings and team collaboration, check out our premium plans.",
    },
    {
      question: "What browsers and devices does Screenbolt support?",
      answer:
        "Screenbolt works on all modern browsers including Chrome, Firefox, Safari, and Edge. It's compatible with Windows, Mac, and Linux systems.",
    },
  ];

  return (
    <div className="space-y-6">
      {faqs.map((faq, index) => (
        <Collapsible
          key={index}
          open={openItems.includes(index)}
          onOpenChange={() => toggleItem(index)}
        >
          <div className="py-4 border-b border-gray-100 last:border-b-0">
            <CollapsibleTrigger className="flex items-center justify-between cursor-pointer w-full text-left">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 pr-4">
                {faq.question}
              </h3>
              <div className="flex-shrink-0">
                {openItems.includes(index) ? (
                  <Minus className="w-6 h-6 text-blue-600" />
                ) : (
                  <Plus className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <p className="text-gray-600 pr-4">{faq.answer}</p>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
}

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Screenbolt",
    description:
      "Fast screen recording and video sharing tool for teams and individuals. Record, share and collaborate instantly.",
    url: "https://Screenbolt.app",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free screen recording tool",
    },
    featureList: [
      "Screen Recording",
      "Video Sharing",
      "Instant Collaboration",
      "Cloud Storage",
      "Team Workspaces",
    ],
    screenshot: "https://Screenbolt.app/assets/demo.webm",
    author: {
      "@type": "Organization",
      name: "Screenbolt",
    },
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AnimatedGradientBackground containerStyle={{ zIndex: -50 }} />

      <Suspense fallback={<div className="h-16 bg-muted animate-pulse" />}>
        <NavbarTop />
      </Suspense>
      {/* Hero Section */}
      <div className="w-full flex flex-col px-6 pt-40 pb-12">
        <p className="font-semibold text-sm tracking-wider text-primary uppercase mx-auto">
          SCREEN RECORDER
        </p>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="text-5xl sm:text-6xl lg:text-8xl tracking-wide font-bold text-neutral-50 leading-tight">
            Share your work, even it&apos;s
            <span>
              <ContainerTextFlip
                words={["undone", "messy", "look bad", "unfinished"]}
                className="ml-4 mt-5"
              />
            </span>
          </div>
          <p className="text-xl leading-relaxed max-w-3xl text-neutral-300 mx-auto">
            With Screenbolt, the journey matters as much as the
            destination—record it, share it, and keep moving.
          </p>
        </div>
        <Link href="/signup" className="mt-8 mx-auto">
          <Button className="rounded-full text-2xl p-8">Join Beta</Button>
        </Link>
      </div>

      {/* Video Section */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <video
            className="w-full rounded-2xl shadow-2xl"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/assets/demo.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Trust Section */}
      <div className="container mx-auto px-6 pt-16 pb-16 md:pb-32 hidden">
        <div className="text-center space-y-12">
          <h2 className="uppercase text-neutral-500 font-bold text-sm sm:text-base md:text-lg tracking-wider">
            Used by companies and people working at
          </h2>

          {/* Company Logos */}
          <div className=" flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60 hidden">
            {[
              "360Learning",
              "bambooHR",
              "Casper",
              "The Container Store",
              "MOZ",
              "Lorem",
            ].map((company, index) => (
              <div key={index} className="font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="w-full mx-auto px-6 py-20">
        {/* Section Header */}
        <div className="text-center pb-20">
          <h2 className="text-5xl md:text-6xl text-neutral-900 font-bold leading-tight mb-8">
            More than just a screen recorder
          </h2>
          <p className="sm:text-xl text-neutral-500 max-w-3xl mx-auto">
            Discover how our platform transforms the way you create, share, and
            watch videos with cutting-edge technology and seamless user
            experience.
          </p>
        </div>
        {/* Feature Section 1 */}
        <div className="w-full max-w-6xl mx-auto pb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
            {/* Left - Video Gallery Mockup */}
            <div className="flex-1">
              {/* Browser Interface */}
              <Image
                src="/assets/illustration-clipper-board.webp"
                alt="Video gallery placeholder"
                width={440}
                height={440}
                className="w-[440px] mx-auto aspect-[4/3] sm:aspect-square object-cover rounded-3xl"
              />
            </div>

            {/* Right - Text Content */}
            <div className="flex-1 space-y-3 lg:space-y-6">
              <h2 className="text-2xl lg:text-4xl font-bold leading-tight">
                Ready? Action!
              </h2>
              <p className="sm:text-lg">
                Start recording instantly with just one click. No complex setup,
                no technical knowledge required. Screenbolt makes screen
                recording as simple as pressing a button, so you can focus on
                what matters most—your work.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold text-lg hover:text-blue-700"
              >
                Get Started →
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Section 2 */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col-reverse md:flex-row gap-6 md:gap-12 items-center">
            {/* Right - Text Content */}
            <div className="flex-1 space-y-3 lg:space-y-6">
              <h2 className="text-2xl lg:text-4xl font-bold leading-tight">
                Share it to your team, or to the world!
              </h2>
              <p className="sm:text-lg">
                Instantly share your recordings with secure links. Whether
                it&apos;s a quick demo for your team, a tutorial for clients, or
                feedback for stakeholders—your content reaches the right people
                at the right time.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold text-lg hover:text-blue-700"
              >
                Get Started →
              </Link>
            </div>

            {/* Right - Video Gallery Mockup */}
            <div className="flex-1">
              {/* Browser Interface */}
              <Image
                src="/assets/world-illustration.webp"
                alt="Video gallery placeholder"
                className="w-[440px] mx-auto aspect-[4/3] sm:aspect-square object-cover rounded-3xl"
                width={500}
                height={500}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex w-full px-6 md:pb-16">
        <div className="flex-col sm:flex-row w-full max-w-6xl mx-auto rounded-3xl gap-4 sm:rounded-full text-white dark:bg-black dark:border-white/[0.15] bg-gradient-to-b from-neutral-800 to-neutral-950 shadow-[0_1px_2px_#00000045,0_0_#000,inset_1px_1px_#ffffff5,inset_0_2px_1px_#ffffff50] flex justify-between items-center space-x-2 px-8 md:px-20 py-6">
          <h2 className="text-center text-white text-3xl sm:text-4xl font-bold">
            Like what you see so far?
          </h2>
          <Link href="/signup">
            <Button className="p-8 text-2xl flex rounded-full whitespace-nowrap">
              Join Demo
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards Section */}
      <div className="w-full max-w-7xl mx-auto px-6 py-20">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Work smarter, not harder
            <br /> with Screenbolt.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the freedom of asynchronous communication. Record once,
            share everywhere, and let your team catch up on their own time—no
            more scheduling conflicts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 - Search Results */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl shadow-xl">
            {/* Top mockup area */}
            <Image
              src="/assets/women-sits-on-sofa.webp"
              alt="Search results placeholder"
              className="w-full mx-auto aspect object-cover rounded-t-2xl"
              width={500}
              height={500}
            />

            <div className="space-y-6 p-8">
              <h3 className="text-3xl font-bold text-white">
                Sit back, relax, watch it from anywhere.
              </h3>
              <p className="text-white/90 text-lg">
                Your recordings are always ready when you are.
              </p>
            </div>
          </div>

          {/* Card 2 - Search Results */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-3xl shadow-xl">
            {/* Top mockup area */}
            <Image
              src="/assets/women-with-coffee.webp"
              alt="Search results placeholder"
              className="w-full mx-auto aspect object-cover rounded-t-2xl"
              width={500}
              height={500}
            />

            <div className="space-y-6 p-8">
              <h3 className="text-3xl font-bold text-white">
                Do your own thing, replay later.
              </h3>
              <p className="text-white/90 text-lg">
                Access your recordings on your own schedule.
              </p>
            </div>
          </div>

          {/* Card 3 - Search Results */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl shadow-xl">
            {/* Top mockup area */}
            <Image
              src="/assets/men-on-desk.webp"
              alt="Search results placeholder"
              className="w-full mx-auto aspect object-cover rounded-t-2xl"
              width={500}
              height={500}
            />

            <div className="space-y-6 p-8">
              <h3 className="text-3xl font-bold text-white">
                Stay in sync, even async.
              </h3>
              <p className="text-white/90 text-lg">
                Share recordings and let everyone catch up—no scheduling needed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-0 rounded-r-3xl lg:rounded-l-none rounded-l-3xl">
            {/* Left - FAQ Header (1/3 width) */}
            <div className="bg-gradient-to-br my-2 from-blue-300 to-blue-400 rounded-l-3xl lg:rounded-r-none rounded-r-3xl p-8 lg:p-12 flex flex-col justify-center">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 leading-tight">
                  Frequently asked questions
                </h2>
                <p className="text-white text-lg">
                  Get all the As to your FAQs.
                </p>
              </div>
            </div>

            {/* Right - FAQ Items (2/3 width) */}
            <div className="lg:col-span-2 bg-white border border-border rounded-r-3xl lg:rounded-l-none rounded-l-3xl p-8 lg:p-12">
              <FAQItems />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-16 border-t">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Brand */}
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900">Screenbolt</h3>
              <p className="text-gray-600 max-w-sm mx-auto md:mx-0">
                Record, share, and collaborate with async video messaging.
              </p>
            </div>
            <div className="flex flex-col text-center md:text-right">
              <p className="gap-2">
                Built with ❤️ by{" "}
                <span>
                  <a
                    href="https://etalas.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Etalas.com
                  </a>
                </span>
              </p>{" "}
              <p className="mt-2">
                &copy; 2024 Screenbolt. All rights reserved.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center md:justify-end mt-4">
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
