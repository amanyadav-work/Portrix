'use client';

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/Rating";
import FEATURES from "@/constants/features";
import TESTIMONIALS from "@/constants/testimonials";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Home = () => {
  return (
    <div className=" overflow-hidden bg-background text-foreground ">
      <Header />
      <div className="h-screen overflow-auto ">

        <div className="flex flex-col my-container mx-auto  ">
          {/* Hero Section */}
          <section className="pt-44 pb-16 text-center bg-background">
            <div className="container mx-auto px-0 flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-extrabold max-w-4xl leading-tight mb-6">
                Simplify your 3D workflow with visualization at <span className="text-primary">Portrix</span>
              </h1>
              <p className="text-base  text-muted-text max-w-2xl mb-8">
                Upload, preview, and fine-tune your GLB models — animations, lighting, transforms, and more — all in the browser. No installs. Just instant visual feedback.
              </p>

            </div>
          </section>

          <SectionCards />

          {/* Features */}
          <section id="features" className="py-16">
            <div className="container mx-auto space-y-20 px-0">
              {FEATURES.map((ft, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col-reverse md:flex-row ${idx % 2 === 0 ? "md:flex-row-reverse" : ""} items-center gap-12`}
                >
                  {/* Text */}
                  <div className="w-full md:w-1/2 space-y-4 text-left">
                    <span className="text-xs font-semibold text-muted-text uppercase tracking-wide">
                      {ft.subheading}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold">{ft.heading}</h2>
                    <p className="text-sm md:text-sm text-muted-text">{ft.description}</p>
                    <Link
                      href={ft.cta_link || "/"}
                      className="text-primary font-medium inline-flex items-center gap-1 group hover:underline"
                    >
                      {ft.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Image */}
                  <div className="w-full md:w-1/2 flex justify-center">
                    <img
                      src={ft.image}
                      alt={ft.heading}
                      className="max-w-[500px] border border-muted rounded p-3 bg-surface"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="py-20 bg-surface">
            <div className="container mx-auto px-0 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-12">
                Trusted by 3D artists, game devs, and tech studios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {TESTIMONIALS.map((testimonial, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded border border-muted bg-background shadow-md space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-text">{testimonial.title}</h3>
                    <StarRating rating={Math.floor(Math.random() * 3 + 3)} />
                    <p className="text-sm text-muted-text">{testimonial.review}</p>
                    <div className="w-10 border-t border-muted" />
                    <p className="text-xs text-muted-text">
                      <span className="font-semibold text-text">{testimonial.author}</span>
                      <i className="block text-muted-text">{testimonial.position}</i>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-16 bg-background text-center">
            <div className="container mx-auto px-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Skip the bloat. Build your pipeline smarter.
              </h2>
              <p className="text-muted-text max-w-2xl mx-auto mb-6">
                Whether you&apos;re preparing game-ready assets, previewing character rigs, or sharing iterations with your team — absento.ai gives you speed without sacrifice.
              </p>
              <Link href="/sandbox">
                <Button size="lg">Launch Viewer</Button>
              </Link>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </div>


  );
};

export default Home;



import { useEffect, useRef } from "react"
import gsap from "gsap"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Header from "@/components/Header";

const cardData = [
  {
    title: "Total Revenue",
    value: "$1,250.00",
    change: "+12.5%",
    isPositive: true,
    footerText: "Trending up this month",
    subtext: "Visitors for the last 6 months",
  },
  {
    title: "New Customers",
    value: "1,234",
    change: "-20%",
    isPositive: false,
    footerText: "Down 20% this period",
    subtext: "Acquisition needs attention",
  },
  {
    title: "Active Accounts",
    value: "45,678",
    change: "+12.5%",
    isPositive: true,
    footerText: "Strong user retention",
    subtext: "Engagement exceed targets",
  },
  {
    title: "Growth Rate",
    value: "4.5%",
    change: "+4.5%",
    isPositive: true,
    footerText: "Steady performance increase",
    subtext: "Meets growth projections",
  },
]

export function SectionCards() {
  const cardRefs = useRef([])

  useEffect(() => {
    cardRefs.current.forEach((card) => {
      if (!card) return

      const shine = card.querySelector("[data-shine]")

      const animateShine = () => {
        gsap.fromTo(
          shine,
          { left: "-100%" },
          {
            left: "100%",
            duration: 1,
            ease: "power2.out",
          }
        )
      }

      card.addEventListener("mouseenter", animateShine)
      return () => card.removeEventListener("mouseenter", animateShine)
    })
  }, [])

  return (
    <div className="grid grid-cols-3 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cardData.map((card, index) => (
        <Card
          key={index}
          ref={(el) => (cardRefs.current[index] = el)}
          className="relative overflow-hidden @container/card bg-gradient-to-t from-primary/5 to-card dark:from-card dark:to-card shadow-xs"
        >
          {/* Shine overlay using Tailwind */}
          <div
            data-shine
            className="pointer-events-none absolute top-0 h-full w-1/3 bg-green-200/5 blur-sm opacity-75"
            style={{ transform: "skewX(-20deg)" }}
          />

          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.isPositive ? (
                  <TrendingUp className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4" />
                )}
                {card.change}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footerText}{" "}
              {card.isPositive ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">{card.subtext}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
