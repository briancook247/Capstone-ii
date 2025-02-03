/**
 * Capstone II STG-452
 * Authors: Brian Cook, Dima Bondar, James Green
 * Professor: Bill Hughes
 * Our Own Work
 * License: MIT
 *
 *  */

"use client";

function HeroSection() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl font-bold">Welcome to API Doc Assistant</h1>
      <p className="mt-4 text-lg">
        Discover, interact, and chat with your API documentation.
      </p>
    </section>
  );
}

function DemoSection() {
  return (
    <section className="py-16 text-center">
      <h2 className="text-3xl font-semibold">Demo Section</h2>
      <p className="mt-4">
        This section demonstrates the core features of our product.
      </p>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-16 text-center">
      <h2 className="text-3xl font-semibold">Features</h2>
      <p className="mt-4">
        Explore the powerful features that make our tool unique.
      </p>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 text-center">
      <h2 className="text-3xl font-semibold">Get Started Today</h2>
      <p className="mt-4">
        Join us and start building amazing applications with your API documentation.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-6 text-center border-t">
      <p className="text-sm text-gray-500">
        © 2025 API Doc Assistant. All rights reserved.
      </p>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <DemoSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
