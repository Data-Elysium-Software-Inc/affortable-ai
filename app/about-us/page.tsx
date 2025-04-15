'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation'; 
import { useSession } from 'next-auth/react';


export default function AboutUs() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Horizontal carousel refs for Sections 4 and 5
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselRefPR = useRef<HTMLDivElement>(null);

  const router = useRouter(); 

  // Get the current session using next-auth
  const { data: session } = useSession();

  // Define the developers array here
  const developers = [
    { name: 'Tasnimul Hossain Tomal', image: '/images/ourExperts/Dev_Tomal.jpg'},
    { name: 'Kabid Hasan', image: '/images/ourExperts/Dev_Kabid.png'},
    { name: 'Saifullah Hafiz', image: '/images/ourExperts/Dev_Saifullah.png'},
    { name: 'Sadatul Islam Sadi', image: '/images/ourExperts/Dev_Sadi.png'},
    { name: 'Sifat Hossain', image: '/images/ourExperts/Dev_Sifat.png'},
    { name: 'Intesar Tahmid', image: '/images/ourExperts/Dev_Tahmid.jpg'},
  ];

  // Define the public relations array here
  const publicrelations = [
    { name: 'Mubashshira Tasneem', image: '/images/ourExperts/PR_Mubashshira.jpg'},
    { name: 'Ashikul Islam Tahin', image: '/images/ourExperts/PR_Tahin.jpg'},
  ];

  // Handle Sign Up button click
  const handleSignUpClick = () => {
    router.push('/register'); // Redirect to the register page
  };

  // Handle Login button click
  const handleLoginClick = () => {
    router.push('/login'); // Redirect to the login page
  };

  // Handle Home button click (for logged-in users)
  const handleHomeClick = () => {
    router.push('/'); // Redirect to the home page
  };


  // Vertical scroll: scroll to section by index
  const scrollToSection = (index: number) => {
    if (sectionsRef.current) {
      const sections = sectionsRef.current.children;
      if (sections[index]) {
        sections[index].scrollIntoView({ behavior: 'smooth' });
        setCurrentIndex(index);
      }
    }
  };

  // Vertical scroll: arrow key navigation (for 5 sections: indices 0–4)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' && currentIndex < 4) {
      scrollToSection(currentIndex + 1);
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      scrollToSection(currentIndex - 1);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Horizontal scroll for Developers carousel (Section 4)
  const scrollAmount = 400;
  const scrollLeftCarousel = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };
  const scrollRightCarousel = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Horizontal scroll for Public Relations carousel (Section 5)
  const scrollLeftCarouselPR = () => {
    if (carouselRefPR.current) {
      carouselRefPR.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };
  const scrollRightCarouselPR = () => {
    if (carouselRefPR.current) {
      carouselRefPR.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Vertical scrollable container with snap */}
      <div ref={sectionsRef} className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        
        {/* --- SECTION 1: About Us --- */}
        <section className="h-screen bg-white snap-start flex items-center justify-center">
          <div className="bg-white min-h-screen">
            {/* Top Navigation */}
            <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
              <img
                src="/images/logo/logo-text-light.png"
                alt="AFFORDABLE.AI"
                width={200}
                height={200}
              />
              <div className="space-x-4">

                {session ? (
                  // Logged-in users see only Home button
                  <button
                    onClick={handleHomeClick}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 cursor-pointer"
                  >
                    Home
                  </button>
                ) : (
                  // Non-logged-in users see Sign Up and Login buttons
                  <>
                <button 
                onClick={handleSignUpClick}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 cursor-pointer">
                  Sign Up
                </button>
                <button 
                onClick={handleLoginClick} 
                className="border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50 cursor-pointer">
                  Login
                </button>
                </>
                )}
              </div>
            </header>
            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 flex items-center">
              <div className="w-full pr-8">
                <br />
                <h1 className="text-6xl font-bold text-black ml-4 mb-11">About Us</h1>
                <p className="text-3xl text-black ml-52 mr-40">
                  Affortable.AI breaks the mold. Pay-as-you-go access to the most powerful AI models—no subscriptions, just results. AI for the future, now at your fingertips. Welcome to Affortable.AI.
                </p>
                <br />
                <div className="grid place-items-end">
                  <img
                    src="/images/demo/aboutUSdemo.png"
                    alt="Demo"
                    className="-m-12 mt-2"
                    height={450}
                    width={550}
                  />
                </div>
              </div>
            </main>
          </div>
        </section>

        {/* --- SECTION 2: Who We Are --- */}
        <section className="bg-black text-white min-h-screen snap-start">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Heading, Underline, and Image */}
              <div>
                <h2 className="text-7xl font-bold mb-8">Who we are?</h2>
                <div className="w-40 h-1 bg-blue-500 mb-32"></div>
                <img
                  src="/images/demo/WhoWeAredemo.png"
                  alt="Team Illustration"
                  height={350}
                  width={350}
                />
              </div>
              {/* Right Column: Text Blocks */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-semibold mt-16 mb-8">We&apos;re Autonomous</h2>
                  <p className="leading-relaxed">
                    AI with freedom. No restrictions, no locks. You choose, you pay, you create. Affortable.AI lets you build at your speed, your budget.
                  </p>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold mt-16 mb-8">We&apos;re Efficient</h2>
                  <p className="leading-relaxed">
                    Time is money. That&apos;s why Affortable.AI is built to deliver fast, so you can innovate faster. Quick access, zero friction.
                  </p>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold mt-16 mb-8">We&apos;re Experienced</h2>
                  <p className="leading-relaxed">
                    We&apos;re building tomorrow&apos;s AI today. Thousands of businesses trust us to unlock AI&apos;s true power. Ready to take the leap?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: Our Experts --- */}
        <section className="bg-white px-8 py-12 h-screen snap-start">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-black text-7xl font-bold mb-8 hover:underline transition-all duration-200">Our Experts</h1>
            <h2 className="text-black text-3xl font-semibold mt-8 mb-8">Project Managers</h2>
            <div className="flex justify-center items-center h-full"> {/* Ensure container takes full height */}
              <div className="max-w-md mx-auto bg-white rounded-md shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <img
                  src="/images/ourExperts/PM_Mehedi.jpg"
                  alt="Project Managers"
                  height={350}
                  width={350}
                  //className="w-full h-full object-cover"
                />
                <div className="p-4 text-center">
                  <p className="text-black text-xl font-semibold">Mehedi Hasan</p>
                  <p className="text-gray-600">Project Manager</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: Developers Horizontal Carousel --- */}
        <section className="bg-white snap-start px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Title and Arrow Buttons */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold text-black">Developers</h2>
              <div className="flex space-x-4">
                <button
                  onClick={scrollLeftCarousel}
                  className="p-2 rounded-full border border-gray-300 text-black hover:bg-gray-200 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={scrollRightCarousel}
                  className="p-2 rounded-full border border-gray-300 text-black hover:bg-gray-200 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Horizontal Carousel */}
            <div className="overflow-hidden">
              <div ref={carouselRef} className="flex space-x-6 transition-transform duration-300 overflow-x-auto">
                {developers.map((developer, index) => (
                  <div
                    key={index}
                    className="min-w-[200px] bg-white rounded-md shadow-md overflow-hidden text-center hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                  >
                    <img
                      src={developer.image}
                      alt={developer.name}
                      className="w-full h-auto"
                    />
                    <div className="p-4">
                      <p className="text-black text-xl font-semibold">{developer.name}</p>
                      <p className="text-gray-600">Developer</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 5: Public Relations Horizontal Carousel --- */}
        <section className="bg-white snap-start px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold text-black">Public Relations</h2>
              <div className="flex space-x-4">
                <button
                  onClick={scrollLeftCarouselPR}
                  className="p-2 rounded-full border border-gray-300 text-black hover:bg-gray-200 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={scrollRightCarouselPR}
                  className="p-2 rounded-full border border-gray-300 text-black hover:bg-gray-200 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-hidden">
              <div ref={carouselRefPR} className="flex space-x-6 transition-transform duration-300 overflow-x-auto">
                {publicrelations.map((publicrelation, index) => (
                  <div
                    key={index}
                    className="min-w-[200px] bg-white rounded-md shadow-md overflow-hidden text-center hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                  >
                    <img
                      src={publicrelation.image}
                      alt={publicrelation.name}
                      height={256}
                      width={256}
                      //className='w-full h-auto'
                    />
                    <div className="p-4">
                      <p className="text-black text-xl font-semibold">{publicrelation.name}</p>
                      <p className="text-gray-600">Public Relations</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
