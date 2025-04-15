'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation'; 
import { useSession } from 'next-auth/react';
import { FaCheckCircle } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaLinkedin } from 'react-icons/fa6';
// import Spline from '@splinetool/react-spline/next';

export default function Welcome() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Horizontal carousel refs for Sections 4 and 5
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselRefPR = useRef<HTMLDivElement>(null);

  const router = useRouter(); 

  // Get the current session using next-auth
  const { data: session } = useSession();

  // Handle Sign Up button click
  const handleSignUpClick = () => {
    console.log('register');
    router.push('/register'); // Redirect to the register page
  };

  // Handle Login button click
  const handleLoginClick = () => {
    console.log('login');
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

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Vertical scrollable container with snap */}
      <div
        ref={sectionsRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      >
        {/* --- SECTION 1: About Us --- */}
        <section className="min-h-screen md:h-screen bg-white snap-start flex items-center justify-center w-full">
          <div className="min-h-screen w-full bg-[linear-gradient(20deg,#B8D9FB_20%,#F9F9F9_80%)]">
            {/* Top Navigation */}
            <header className="bg-white flex md:flex-row items-center justify-between px-2 md:px-8 py-4 border-b border-gray-200 w-full">
              <img
                src="/images/logo/logo-text-light.png"
                alt="AFFORTABLE.AI"
                width={150}
                height={150}
                className=""
              />
              <div className="flex space-x-2 md:space-x-4 w-1/2 md:w-64">
                {session ? (
                  // Logged-in users see only Home button
                  <button
                    onClick={handleHomeClick}
                    className="bg-blue-500 text-white px-2 w-1/2 md:px-4 py-2 rounded hover:bg-blue-400 cursor-pointer"
                  >
                    Home
                  </button>
                ) : (
                  // Non-logged-in users see Sign Up and Login buttons
                  <>
                    <button
                      onClick={handleSignUpClick}
                      className="bg-blue-500 text-white w-1/2  px-1 md:px-4 py-2 rounded hover:bg-blue-400 cursor-pointer"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={handleLoginClick}
                      className="border border-blue-500 w-1/2  text-blue-500 px-1 md:px-4 py-2 rounded hover:bg-blue-50 cursor-pointer"
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            </header>
            {/* Main Content */}
            <main className="px-4 py-12 flex flex-col md:flex-row items-center w-full h-full">
              <div className="w-full md:w-1/2 px-4 md:px-12">
                <div className="text-4xl md:text-8xl text-black mb-6">
                  Pay as you go <span className="font-bold">AI</span>
                </div>
                <div className="text-xl md:text-3xl text-black mb-6">
                  All in one premium AI access like{' '}
                  <span className="font-bold">Midjourney, </span>
                  <span className="font-bold">Slidemaker, </span>
                  <span className="font-bold">Humanizer, </span>
                  <span className="font-bold">o3-mini</span> and{' '}
                  <span className="font-bold">Claude</span>
                </div>
                <button className="bg-blue-500 text-white rounded py-3 px-5 text-xl w-fit" onClick={handleLoginClick} >
                  Get Started
                </button>
              </div>
              <div className="w-full md:w-1/2 px-4 md:px-12">
                <div className="flex justify-center items-center">
                  <img
                    src="/images/welcome/LeftColumn.svg"
                    alt="Demo"
                    className="-m-6 mt-2"
                    height={525}
                    width={600}
                  />
                </div>
              </div>
            </main>
          </div>
        </section>

        {/* --- SECTION 2: Why Affortable.AI? --- */}
        <section className="bg-white snap-start w-full min-h-screen">
          <div className="w-full bg-white">
            <div className="px-8 md:px-32 pt-8 md:pt-40 text-black text-4xl md:text-8xl">
              Why{' '}
              <span className="bg-gradient-to-b from-[#0705E8] to-white bg-clip-text text-transparent">
                Affortable.AI?
              </span>
            </div>
            <div className="px-4 md:px-64 pt-4 md:pt-16 pb-8 md:pb-20 text-black text-xl md:text-5xl">
              Get access to powerful AI models like GPT-4o for as little as Tk20.
              No subscriptions—just pay as you go with MFS and bKash. Smart AI, made
              simple and affordable! 🚀
            </div>
          </div>
          <div className="px-4 md:px-32 pb-16 flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 px-2 flex-1">
              <div className="rounded-lg shadow-[0_8px_16px_0_rgba(28,102,168,0.3)] text-black p-4 md:h-auto h-auto m-2 md:mb-4 flex flex-col justify-between">
                <div className="text-xl pb-2 md:pb-24">💰 Cost-Effective AI Access</div>
                <div className="text-md pb-4">
                  <div>
                    AI should be for everyone—not just those who can afford expensive
                    subscriptions.
                  </div>{' '}
                  <div className="font-bold">Start with as little as $1.</div>
                </div>
              </div>
              <div className="rounded-lg  shadow-[0_8px_16px_0_rgba(28,102,168,0.3)] text-black p-4 md:h-auto h-auto m-2  flex flex-col justify-between">
                <div className="text-xl pb-2 md:pb-24">⚡ Unlock AI & Boost Productivity</div>
                <div className="text-md pb-4">
                  From brainstorming to content creation, Affortable.AI empowers
                  developers, writers, students, and businesses.
                </div>
              </div>
            </div>
            <div className="hidden w-full md:w-1/3 px-2 flex-1 md:flex flex-col items-center">
              <div className="w-full flex justify-center">
                <img
                  src="/images/welcome/Floating Robot 1.svg"
                  alt="Demo"
                  className=""
                  height={600}
                  width={360}
                />
              </div>
              <div className="w-full flex justify-center bg-gradient-to-b from-[#0732B3] to-[#FFFFFF] bg-clip-text text-transparent text-2xl md:text-2xl font-extrabold pt-4 text-center">
                Just pure AI power, on demand.
              </div>
              <div className="w-full flex justify-center p-4 md:p-8">
                <button className="bg-[#1B65A7] p-3 md:p-4 rounded font-light" onClick={handleLoginClick}>
                  Try AI Now for $1
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-2 flex-1">
              <div className="rounded-lg shadow-[0_8px_16px_0_rgba(28,102,168,0.3)] text-black p-4 md:h-auto h-auto m-2 md:mb-4 flex flex-col justify-between">
                <div className="text-xl pb-2 md:pb-24">🚀 All-in-One AI Platform</div>
                <div className="text-md pb-4">
                  <div>
                    Access multiple AI models (GPT-4o, DALL·E, and more) under one roof.
                  </div>{' '}
                  <div className="font-bold">No need for separate subscriptions.</div>
                </div>
              </div>
              <div className="rounded-lg  shadow-[0_8px_16px_0_rgba(28,102,168,0.3)] text-black p-4 md:h-auto h-auto m-2 flex flex-col justify-between">
                <div className="text-xl pb-2 md:pb-24">🤖 Build Your Own AI Bot</div>
                <div className="text-md pb-4">
                  Customize AI bots for personal or business use—train them for customer
                  support, content writing, or personal assistance.
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-2 flex-1 md:hidden  flex-col items-center">
              <div className="w-full flex justify-center">
                <img
                  src="/images/welcome/Floating Robot 1.svg"
                  alt="Demo"
                  className="-m-4 md:-m-12 mt-2"
                  height={300}
                  width={180}
                />
              </div>
              <div className="w-full flex justify-center bg-gradient-to-b from-[#0732B3] to-[#FFFFFF] bg-clip-text text-transparent text-2xl md:text-2xl font-extrabold pt-8 md:pt-20">
                Just pure AI power, on demand.
              </div>
              <div className="w-full flex justify-center p-4 md:p-8">
                <div className="bg-[#1B65A7] p-3 md:p-4 rounded font-light">
                  Try AI Now for $1
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: AI at Your Fingertips --- */}
        <section className="min-h-screen xl:h-screen snap-start w-full bg-[#D3E0F4]">
          <div className="px-8 md:px-32 py-8 md:py-16 text-black text-4xl md:text-8xl">
            <span className="bg-gradient-to-b from-[#0705E8] to-white bg-clip-text text-transparent">
              AI
            </span>{' '}
            at Your Fingertips
          </div>
          <div className="px-4 md:px-32 w-full flex justify-center">
            <div className="pb-4 xl:pb-0 md:pb-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 content-start gap-4 w-full">
              {[
                { src: '/images/welcome/openai.svg', title: 'GPT-4o' },
                { src: '/images/welcome/openai.svg', title: 'DALL-E' },
                { src: '/images/welcome/openai.svg', title: 'o3-mini' },
                { src: '/images/welcome/openai.svg', title: 'o1-mini' },
                { src: '/images/welcome/anthropic.svg', title: 'Claude Sonnet' },
                { src: '/images/welcome/anthropic.svg', title: 'Claude Haiku' },
                { src: '/images/welcome/deepseek.svg', title: 'DeepSeek R1' },
                { src: '/images/welcome/gemini.svg', title: 'Gemini-1.5' },
                { src: '/images/welcome/anthropic.svg', title: 'Claude Sonnet' },
                { src: '/images/welcome/pdf.svg', title: 'PDF' },
                { title: 'Rest Coming Soon' }
              ].map((item, index) => (
                <div key={index} className="h-32 md:h-48 bg-white rounded-xl flex flex-col justify-center items-center p-2">
                  {item.src ? (
                    <img
                      src={item.src}
                      alt="Demo"
                      className="w-1/2 h-1/2"
                      height={450}
                      width={550}
                    />
                  ) : null}
                  {item.title && (
                    <div className="text-black text-lg md:text-xl font-medium text-center">
                      {item.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECTION 4: AI for Every Budget (Pricing) --- */}
        <section className="bg-white snap-start w-full min-h-screen">
          <div className="px-4 md:px-0 w-full bg-white">
            <div className="pt-8 md:pt-16 text-black text-4xl md:text-8xl text-center">
              AI for{' '}
              <span className="bg-gradient-to-b from-[#0705E8] to-white bg-clip-text text-transparent">
                Every Budget
              </span>
            </div>
            <div className="pt-4 md:pt-8 pb-8 md:pb-20 text-black text-2xl md:text-5xl text-center">
              Transparent Pricing. No Surprises.
            </div>
            <div className="w-full flex justify-center pb-8 md:pb-32">
              <div className="w-full sm:w-3/4 md:w-1/5 bg-[linear-gradient(130deg,#0732B3_5%,#FFFFFF_95%)] rounded-xl">
                <div className="border-b-2 border-white px-4 pt-4 md:pt-6 pb-4 md:pb-6">
                  <div>For just</div>
                  <div className="text-2xl md:text-3xl">$1</div>
                </div>
                <div className="p-3 md:p-5 font-thin">
                  <div className="flex items-center pb-2 md:pb-4">
                    <FaCheckCircle />
                    <div className="pl-2">GPT-4o: 190 messages</div>
                  </div>
                  <div className="flex items-center pb-2 md:pb-4">
                    <FaCheckCircle />
                    <div className="pl-2">Dall-E: 22 Images</div>
                  </div>
                  <div className="flex items-center pb-2 md:pb-4">
                    <FaCheckCircle />
                    <div className="pl-2">o3 mini: 433 messages</div>
                  </div>
                  <div className="flex items-center pb-2 md:pb-4">
                    <FaCheckCircle />
                    <div className="pl-2">Claude: 128 messages</div>
                  </div>
                  <div className="flex items-center pb-2 md:pb-4">
                    <FaCheckCircle />
                    <div className="pl-2">Slidemaker: 20 slides</div>
                  </div>
                  <button
                    className="mt-2 md:mt-4 text-md text-[#1B65A7] bg-white font-normal rounded-md text-center p-2"
                    onClick={handleLoginClick}
                  >
                    Get Started for $1
                  </button>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 5: Payment Methods & Footer --- */}
        <section className="bg-white snap-start w-full">
          <div className="w-full bg-[#D3E0F4] p-8 md:p-24">
            <div className="text-black text-4xl md:text-8xl text-center pb-4 md:pb-16">
              You can<span className="text-[#0732B3]"> Pay </span>with
            </div>
            <div className="w-full flex flex-wrap justify-center px-4 md:px-16 items-center">
              {[
                '/images/welcome/bkash.svg',
                // '/images/welcome/nogod.svg',
                '/images/welcome/visa.svg',
                '/images/welcome/mastercard.svg',
                '/images/welcome/americanexpress.svg'
              ].map((logo, idx) => (
                <div key={idx} className="w-1/3 sm:w-1/5 flex items-center justify-center p-2">
                  <img
                    src={logo}
                    alt="Payment"
                    className="w-full"
                    style={{ width: '50%', height: '50%' }} // Scale the image to 75% of its original size
                  />
                </div>

              ))}
            </div>
          </div>
          {/* <div className="w-full px-4 md:px-16 flex flex-col md:flex-row py-4 md:py-8 justify-between items-center">
            <div className="text-black text-3xl md:text-6xl text-center mb-4 md:mb-0">
              Download Now
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-4 md:mb-0 mr-0 md:mr-6">
                <img
                  src="/images/welcome/googleplay.svg"
                  alt="Google Play"
                  className="w-full"
                  height={450}
                  width={550}
                />
              </div>
              <div>
                <img
                  src="/images/welcome/applestore.svg"
                  alt="Apple Store"
                  className="w-full"
                  height={450}
                  width={550}
                />
              </div>
            </div>
          </div> */}
          <div className="w-full px-4 md:px-16 flex flex-col md:flex-row py-4 md:py-8 justify-between items-center bg-black text-white">
            <div className="mb-4 md:mb-0">
                © 2025 AffortableAI. All rights reserved
            </div>
            <div className="flex flex-col md:flex-row items-center">
              {/* <div className="flex items-center justify-center space-x-2">
                <div className="px-2">Terms</div>
                <div className="px-2">Privacy Policy</div>
                <div className="px-2">Contact</div>
              </div> */}
              <div className="flex text-2xl mt-4 md:mt-0">
                <a
                  href="https://www.facebook.com/profile.php?id=61559562616655" // Facebook link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white flex justify-center items-center p-2 rounded-full text-black ml-4"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://www.instagram.com/dataelysium" // Instagram link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white flex justify-center items-center p-2 rounded-full text-black ml-4"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.linkedin.com/company/data-elysium-software-inc" // Linkedin link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white flex justify-center items-center p-2 rounded-full text-black ml-4"
                >
                  <FaLinkedin />
                </a>
                <a
                  href="https://www.youtube.com/@DataElysium" // YouTube link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white flex justify-center items-center p-2 rounded-full text-black ml-4"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// function Bot() {
//   return (
//     <main>
//       <Spline scene="https://prod.spline.design/LjemuWZVmgk06Rk6/scene.splinecode" />
//     </main>
//   );
// }
