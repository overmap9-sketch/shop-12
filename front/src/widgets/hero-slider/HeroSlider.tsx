import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../shared/ui/Button';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Premium Interior Paint',
    subtitle: 'Low Odor • Low VOC',
    description: 'Beautiful, durable finishes for every room. Shop matte, eggshell, satin, and semi-gloss in thousands of colors.',
    image: 'https://images.pexels.com/photos/7217966/pexels-photo-7217966.jpeg',
    ctaText: 'Shop Interior Paint',
    ctaLink: '/catalog?category=interior-paint',
    badge: 'Color Match Available',
  },
  {
    id: '2',
    title: 'Exterior Paint That Lasts',
    subtitle: 'UV & Weather Resistant',
    description: 'Protect your home with premium exterior paints for siding, trim, and doors in long-lasting sheens.',
    image: 'https://images.pexels.com/photos/221027/pexels-photo-221027.jpeg',
    ctaText: 'Shop Exterior Paint',
    ctaLink: '/catalog?category=exterior-paint',
  },
  {
    id: '3',
    title: 'Primers, Stains & More',
    subtitle: 'Prep • Protect • Finish',
    description: 'From bonding primers to deck stains and cabinet paints—everything you need for a flawless finish.',
    image: 'https://images.pexels.com/photos/2293822/pexels-photo-2293822.jpeg',
    ctaText: 'Explore Finishes',
    ctaLink: '/catalog?category=specialty-coatings',
    badge: 'Pro Pricing',
  },
];

export function HeroSlider() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-muted">
      {/* Slides */}
      <div className="relative h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
              index === currentSlide 
                ? 'translate-x-0' 
                : index < currentSlide 
                  ? '-translate-x-full' 
                  : 'translate-x-full'
            }`}
          >
            <div className="relative h-full">
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl text-white">
                    {slide.badge && (
                      <div className="inline-block bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
                        {slide.badge}
                      </div>
                    )}
                    
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                      {slide.title}
                    </h1>
                    
                    <p className="text-xl md:text-2xl font-medium mb-4 text-gray-200">
                      {slide.subtitle}
                    </p>
                    
                    <p className="text-lg mb-8 text-gray-300 max-w-xl">
                      {slide.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button size="lg" asChild>
                        <Link to={slide.ctaLink}>
                          {slide.ctaText}
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        {t('common.learnMore')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div className="absolute bottom-6 right-6 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Auto-play
          </div>
        </div>
      )}
    </section>
  );
}
