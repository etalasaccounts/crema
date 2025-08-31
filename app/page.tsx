"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import { NavbarDemo } from "./navbar";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import AnimatedGradientBackground from "@/components/magicui/animated-gradient-background";

export default function HomePage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <AnimatedGradientBackground containerStyle={{ zIndex: -50 }} />

      <NavbarDemo />
      {/* Hero Section */}
      <div className="w-full px-6 pt-40 pb-12">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <p className="font-semibold text-sm tracking-wider text-primary uppercase">
            SCREEN RECORDER
          </p>
          <div className="text-5xl sm:text-6xl lg:text-8xl font-bold text-neutral-50 leading-tight">
            Share your work, even it's{" "}
            <span>
              <ContainerTextFlip
                words={["undone", "messy", "look bad", "unfinished"]}
              />
            </span>
          </div>
          <p className="text-xl leading-relaxed max-w-3xl text-neutral-300 mx-auto">
            With Crema, the journey matters as much as the destination—record
            it, share it, and keep moving.
          </p>

          <Button className="rounded-full text-2xl p-8">Join Beta</Button>
        </div>
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
      <div className="container mx-auto px-6 pt-16 pb-16 md:pb-32">
        <div className="text-center space-y-12">
          <h2 className="uppercase text-muted-foreground font-bold text-sm yygi9n,mol,md:text-lg tracking-wider">
            Used by companies and people working at
          </h2>

          {/* Company Logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60">
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
          <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
            More than just a screen recorder
          </h2>
          <p className="sm:text-xl text-gray-600 max-w-3xl mx-auto">
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
                Ready? action!
              </h2>
              <p className="sm:text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore? Ut enim ad minim veniam.
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold text-lg hover:text-blue-700"
              >
                Lorem ipsum →
              </a>
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore? Ut enim ad minim veniam.
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold text-lg hover:text-blue-700"
              >
                Lorem ipsum →
              </a>
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
          <h2 className="text-white text-2xl sm:text-4xl font-bold">
            Like what you see so far? Join Beta
          </h2>
          <Button className="p-8 text-2xl hidden md:flex rounded-full whitespace-nowrap">
            Join Demo
          </Button>
        </div>
      </div>

      {/* Cards Section */}
      <div className="w-full max-w-7xl mx-auto px-6 py-20">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            A Screen Recorder that changes
            <br /> the way you work.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our platform transforms the way you create, share, and
            watch videos with cutting-edge technology and seamless user
            experience.
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
                ccess your recordings on your own schedule.
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
              <div className="space-y-6">
                {[
                  "How do I start recording my screen with Crema?",
                  "What video formats does Crema support?",
                  "Can I record audio along with my screen recording?",
                  "How do I share my recordings after creating them?",
                  "What are the system requirements for Crema?",
                ].map((question, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
                  >
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 pr-4">
                      {question}
                    </h3>
                    <div className="flex-shrink-0">
                      <Plus className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-16">
        <div className="container mx-auto px-6">
          {/* Top Section - Logo and Tagline */}

          {/* Bottom Section - Copyright and Social */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-200">
            {/* Left - Copyright and Links */}
            <div className="flex flex-col lg:flex-row items-center gap-4 text-sm text-gray-600">
              <span className="font-semibold">SOC 2 Certified</span>
              <div className="flex items-center gap-4">
                <span>2025 All rights reserved.</span>
                <a href="#" className="underline hover:text-blue-600">
                  Site Map
                </a>
                <span>,</span>
                <a href="#" className="underline hover:text-blue-600">
                  Privacy
                </a>
                <span>, and</span>
                <a href="#" className="underline hover:text-blue-600">
                  Terms
                </a>
              </div>
            </div>
            {/* Right - Social Icons */}
            <div className="flex items-center gap-1">
              Built with ❤️ by<span className="text-blue-600">Etalas.com</span>
            </div>{" "}
          </div>
        </div>
      </footer>
    </div>
  );
}
