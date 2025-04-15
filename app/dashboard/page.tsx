'use client';
import { useEffect, useState, useRef } from 'react';
import { PayButton } from "@/components/pay-button";
//import { auth } from '../(auth)/auth';
import BkashPayment from '@/components/bkash-payment';
import { SymbolIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipTrigger,TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { models } from "@/lib/ai/models";
import { GoGear } from "react-icons/go";
import { useTheme } from "next-themes";
import { CiSearch } from "react-icons/ci";
import { AiOutlineFile, AiOutlineOpenAI, AiOutlinePaperClip, AiOutlineTable } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { RiAnthropicFill } from "react-icons/ri";
import { IoVideocam } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { motion } from 'framer-motion';

import { MdSailing } from "react-icons/md";
import { RiMickeyFill } from "react-icons/ri";
import { FaShirt } from "react-icons/fa6";
import { PiHeadCircuitBold } from "react-icons/pi";
import { RiRobot2Line } from "react-icons/ri";
import { TbWriting } from "react-icons/tb";
import { IoDocumentText } from "react-icons/io5";
import { Copy, DivideSquare } from 'lucide-react';

import { BsThreeDots } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";

import { toast } from 'sonner';
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
    
    const { data: session, status } = useSession();
    console.log(session?.user?.email)

    const [isPopUpOpen,setIsPopUpOpen] = useState(false);
    const openPopUp = () =>{
        setIsPopUpOpen(true);
    }


    const { theme } = useTheme();
    const headingSrc =
      theme === "light"
        ? "/images/logo/logo-text-light.png"
        : "/images/logo/logo-text-dark.png";

    //const session = await auth();

    function approximateRemainingMessages(
      balanceCents: number | null,
      modelId: string
    ) {
      if (!balanceCents) return 0;
    
      // Convert user balance from cents -> dollars
      const balanceDollars = balanceCents / 100;
    
      // Find the desired model (e.g., GPT-4o or o1)
      const model = models.find((m) => m.apiIdentifier === modelId);
      if (!model) return 0;
    
      // Pull out inputCostPerToken / outputCostPerToken (in dollars)
      const inputCost = model.inputCostPerToken ?? 0;
      const outputCost = model.outputCostPerToken ?? 0;
    
      // Use the same "100 tokens for input" + "500 tokens for output" approximation
      const totalCost = inputCost * 100 + outputCost * 500;
      if (totalCost <= 0) return 0;
    
      // Floor it to get an integer number of messages
      return Math.floor(balanceDollars / totalCost);
    }

      const [balanceCents, setBalanceCents] = useState<number | null>(null);
      const [loading, setLoading] = useState(true);
    
      const gpt4oRemaining = approximateRemainingMessages(balanceCents, "gpt-4o");
      const o1Remaining = approximateRemainingMessages(balanceCents, "o1");
      const ChatModel: Model[] = [
        {
          id: "claudesonnet",
          name: "Claude Sonnet",
          icon: <RiAnthropicFill />,
          description: "Specialized in code generation and creative writing.",
          capabilities: [
            "Advanced reasoning",
            "Creative writing",
            "Contextual understanding",
            "Code generation",
            "Multilingual support"
          ],
          provider: "Anthropic",
          url: "/select-model?model-id=claude-sonnet"
        },
        {
          id: "claudesonnetextended",
          name: "Claude Sonnet Extended",
          icon: <RiAnthropicFill />,
          description: "Extended version with enhanced performance.",
          capabilities: [
            "Enhanced contextual analysis",
            "Deeper conversation",
            "Improved memory",
            "Robust error handling"
          ],
          provider: "Anthropic",
          url: "/select-model?model-id=claude-sonnet-extended"
        },
        {
          id: "claudehaiku",
          name: "Claude Haiku",
          icon: <RiAnthropicFill />,
          description: "Specialized in faster reasoning and creative writing.",
          capabilities: [
            "Poetic expression",
            "Haiku generation",
            "Minimalist creativity"
          ],
          provider: "Anthropic",
          url: "/select-model?model-id=claude-haiku"
        },
        {
          id: "gpt4o",
          name: "GPT 4o",
          icon: <AiOutlineOpenAI />,
          description:
            "For regular tasks and general-purpose applications.",
          capabilities: [
            "Human-like conversation",
            "Intelligent problem solving",
            "Natural language generation",
            "Context-aware responses"
          ],
          provider: "OpenAI",
          url: "/select-model?model-id=gpt-4o-azure"
        },
        {
          id: "o1mini",
          name: "o1-mini",
          icon: <AiOutlineOpenAI />,
          description: "Lightweight model for quick and efficient responses.",
          capabilities: [
            "Quick response",
            "Efficient processing",
            "Low resource usage"
          ],
          provider: "OpenAI",
          url: "/select-model?model-id=o1-mini"
        },
        {
          id: "gpt4.5*",
          name: "GPT 4.5*",
          icon: <AiOutlineOpenAI />,
          description: "Optimized performance with enhanced throughput.",
          capabilities: [
            "Optimized performance",
            "Increased throughput",
            "Improved accuracy"
          ],
          provider: "OpenAI",
          url: "/select-model?model-id=GPT-4.5"
        },
        {
          id: "o1",
          name: "o1",
          icon: <AiOutlineOpenAI />,
          description: "Reliable model with standard performance.",
          capabilities: [
            "Standard performance",
            "Reliable conversation",
            "Scalable solutions"
          ],
          provider: "OpenAI",
          url: "/select-model?model-id=o1"
        },
        {
          id: "o3mini",
          name: "o3-mini",
          icon: <AiOutlineOpenAI />,
          description: "Compact design for efficient computations.",
          capabilities: [
            "Compact design",
            "Efficient computations",
            "Low latency"
          ],
          provider: "OpenAI",
          url: "/select-model?model-id=o3-mini"
        },
      ];
      
      const IELTS: Model[] = [
        {
          id: "mockly",
          name: "Mockly",
          icon: <AiOutlineFile />,
          description: "Your partner for IELTS exam preparation.",
          capabilities: [
            "Exam preparation",
            "Vocabulary enhancement",
            "Grammar correction",
            "Speaking practice"
          ],
          provider: "OpenAI",
          url: "/select-model?model-id=mockly",
          upcoming: true
        },
      ];
      
      const ImageModels: Model[] = [
        {
          id: "dalle",
          name: "Dall-E",
          icon: <AiOutlineOpenAI />,
          description: "Transform your imagination into vivid imagery.",
          capabilities: [
            "Image generation",
            "Artistic rendering",
            "Style transfer",
            "High-resolution output"
          ],
          provider: "OpenAI",
          url: "/select-model?model-id=dall-e"
        },
        {
          id: "midjourney",
          name: "Midjourney",
          icon: <MdSailing />,
          description: "Transform ideas into artistic visuals.",
          capabilities: [
            "Artistic style transformation",
            "Visual storytelling",
            "Creative imagery"
          ],
          provider: "Midjourney",
          url: "/select-model?model-id=midjourney"
        },
        {
          id: "animefy",
          name: "Animefy",
          icon: <RiMickeyFill />,
          description: "Convert images into anime-style artwork.",
          capabilities: [
            "Anime-style conversion",
            "Frame interpolation",
            "Color enhancement"
          ],
          provider: "Animefy",
          url: "/select-model?model-id=animefy"
        },
        {
          id: "tryonclothes",
          name: "Try on Clothes",
          icon: <FaShirt />,
          description: "Experience virtual clothing try-ons.",
          capabilities: [
            "Virtual try-on",
            "Size recommendation",
            "Style matching"
          ],
          provider: "TryOnAI",
          url: "/select-model?model-id=clothify"
        },
      ];
      
      const AssignmentModels: Model[] = [
        {
          id: "slidemaker",
          name: "Slide Maker",
          icon: <AiOutlineOpenAI />,
          description: "Generate stunning presentations effortlessly.",
          capabilities: [
            "Automatic slide design",
            "Template selection",
            "Dynamic content layout"
          ],
          provider: "OpenAI",
          url: "/select-model?model-id=slidemaker"
        },
        {
          id: "citation",
          name: "Citation GPT",
          icon: <AiOutlineOpenAI />,
          description: "Generate and format citations on demand.",
          capabilities: [
            "Citation formatting",
            "Reference management",
            "Plagiarism checking"
          ],
          provider: "OpenAI",
          url: "/select-model?model-id=citation-gpt"
        },
        {
          id: "humanizer",
          name: "Humanizer",
          icon: <PiHeadCircuitBold />,
          description: "Bypass AI detection with human-like responses.",
          capabilities: [
            "Human emotion simulation",
            "Natural gestures",
            "Facial expression analysis"
          ],
          provider: "HumanizeTech",
          url: "/select-model?model-id=rephrase"
        },
      ];
      
      const VideoModels: Model[] = [
        {
          id: "video1",
          name: "Video Model",
          icon: <IoVideocam />,
          description: "Create and edit videos with ease.",
          capabilities: [
            "Video editing",
            "Scene detection",
            "Audio synchronization"
          ],
          provider: "VideoAI",
          url: "/select-model?model-id=video1"
        },
        {
          id: "video2",
          name: "Video Model",
          icon: <IoVideocam />,
          description: "High-performance video rendering in real-time.",
          capabilities: [
            "Real-time video rendering",
            "Subtitle generation",
            "Motion tracking"
          ],
          provider: "VideoAI",
          url: "/select-model?model-id=video2"
        },
        {
          id: "video3",
          name: "Video Model",
          icon: <IoVideocam />,
          description: "Export videos in high-definition with multiple formats.",
          capabilities: [
            "High-definition export",
            "Multi-format support",
            "Effects integration"
          ],
          provider: "VideoAI",
          url: "/select-model?model-id=video3"
        },
      ];
      
      const Bots: Model[] = [

        {
          id: "speakingbot",
          name: "Speaking Bot",
          icon: <RiRobot2Line />,
          description: "Talk with AI in real-time.",
          capabilities: [
            "Natural speech synthesis",
            "Emotion detection",
            "Voice modulation"
          ],
          provider: "OpenAI",
          url: "/realtime-voice"
        },
        {
          id: "rtaudiotranscription",
          name: "Realtime Audio Transcription",
          icon: <TbWriting />,
          description: "Transcribe audio in real-time accurately.",
          capabilities: [
            "Real-time transcription",
            "Speaker identification",
            "Noise filtering"
          ],
          provider: "Whisper",
          url: "/realtime-transcription"
        },
        {
          id: "texttospeech",
          name: "Text to Speech",
          icon: <IoDocumentText />,
          description: "Convert text into natural voice output.",
          capabilities: [
            "Natural voice output",
            "Multiple voice options",
            "Adjustable speed"
          ],
          provider: "Azure",
          url: "/tts"
        },
      ];
      

    const apiCosts = {
        "gpt-4o": 0.1,
        o1: 2,
      };
    
      const fetchBalance = async () => {
        try {
          const res = await fetch("/api/balance");
          const data = await res.json();
    
          if (res.ok) {
            setBalanceCents(data.balance);
          } else {
            console.error("Failed to fetch balance:", data.error);
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchBalance(); // Initial fetch
        // const interval = setInterval(fetchBalance, 10000); // Fetch every 30 seconds
        // return () => clearInterval(interval); // Cleanup on unmount
      }, []);
    
      const balanceDollars =
        balanceCents !== null ? (balanceCents / 100).toFixed(2) : "0.00";
    
      const calculateRemainingCalls = (cost: number) => {
        if (balanceCents === null) return 0;
        return Math.floor(balanceCents / cost);
      };

      // Define an array of image URLs to show in the carousel
      const carouselImages = [
        "/images/sample-banners/2.jpg",
        "/images/sample-banners/4.jpg",
        "/images/sample-banners/6.jpg",
      ];

    const router = useRouter();
    const [query, setQuery] = useState('');
    // Filter models based on the search query (case insensitive)
    const allModels = [...ChatModel, ...IELTS, ...ImageModels, ...AssignmentModels, ...VideoModels, ...Bots];
    const filteredModels = allModels.filter((model) =>
      model.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className='h-screen w-full overflow-y-auto'>
            <div className='w-full  flex justify-between px-3 py-6 md:px-6 md:py-6'>
                <div className=' flex items-center  gap-3'>
                    <div>
                        <img
                            src="/images/logo/favicon.png"
                            alt="Demo"
                            className=""
                            height={38}
                            width={38}
                        />
                    </div>
                    <div >
                        <PayButton
                            paymentLink={`https://buy.stripe.com/${process.env.STRIPE_ID}?prefilled_email=${session?.user?.email}`}
                            openPopUp={openPopUp}
                        />
                    </div>
                </div>
                <div className=' flex items-center gap-3'>
                    <div>
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div role="button"
                                    className="bg-teal-800 rounded-md dark:bg-zinc-100 hover:bg-teal-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-teal-900 flex py-1.5 px-2  h-fit md:h-[34px] order-4 md:ml-auto items-center gap-2 cursor-pointer"
                                    onClick={fetchBalance}
                                    >
                                        <div className="size-4 bg-red-600 rounded-full" />
                                        {loading ? (
                                                "Loading..."
                                            ) : (
                                                <>
                                                <span className="hidden md:inline">Credits: </span>${balanceDollars}
                                                </>
                                            )}
                                        <SymbolIcon />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="p-2 text-sm">
                                    <div>Approximate Remaining Messages:</div>
                                    <ul className="list-disc ml-4">
                                        <li>GPT-4o: ~{gpt4oRemaining} messages</li>
                                        <li>o1: ~{o1Remaining} messages</li>
                                    </ul>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <SettingsDropdown />
                </div>
            </div>
            <div>
                <div className="px-3 w-full py-3 mb-3 flex justify-center">
                    <div className="w-full md:w-2/3 h-auto bg-muted rounded-3xl overflow-hidden">
                        <ImageCarousel images={carouselImages} interval={5000} />
                    </div>
                </div>
                <div className='px-3 w-full py-3 flex justify-center'>
                    <div className='w-full md:w-2/3  bg-muted rounded-3xl px-6 py-8 md:px-12 md:py-8 text-md'>
                        <div className='pb-7'>
                            <img
                                src={headingSrc}
                                alt="Demo"
                                className=""
                                height={200}
                                width={200}
                            />
                        </div>      
                        <div className='font-bold pb-7'>Pay As You Go Access to the Latest AI Models</div>   
                        <div className='pb-7'>Access the world&apos;s most powerful AI models like GPT 4o and o1 by simply topping up your account when you want with as little as $1. No expensive subscriptions and no credit expiry.
                        Pay only for what you use.</div>   
                        <div>
                            <button className='bg-[#1B65A7] hover:bg-[#145083] active:bg-[#0F3A63] text-white px-4 py-2 rounded text-md' onClick={()=>{router.push("/select-model?model-id=gpt-4o-azure");}}>
                                Get Started
                            </button>
                        </div>      
                    </div>
                </div>
                <div className='px-3 w-full py-3 flex justify-center'>
                    <div className='flex flex-col py-16 w-full md:w-2/3 justify-center '>
                        <div className='text-4xl w-full  font-bold pb-12 text-center'>Use the AI tools as per as your needs</div>
                        <div className='md:px-16'>
                            <div className='w-full w-full relative'>
                                <CiSearch className=" absolute left-6 top-1/2 transform -translate-y-1/2 text-3xl text-muted-foreground" />
                                <input type="text"  placeholder=' Search Tools' className='rounded-xl flex h-10 w-full  border border-input bg-background pr-3 pl-14 py-7 text-xl ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50' 
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Conditional rendering based on search query */}
              {query ? (
                <div>
                  <ModelsSection
                      title="Search"
                      subtitle="Found Models"
                      models={filteredModels}
                  />
                </div>
                      ) : (
                        // Show all other sections when no search text is entered
                <div>
                  <ModelsSection
                      id="chat-section"
                      title="Chat"
                      subtitle="Foundational models for chatbots and conversational agents"
                      models={ChatModel}
                  />
                  <ModelsSectionSingleRow
                      id="ielts-section"
                      title="Preparing for ILETS"
                      subtitle="Need help with IELTS exam?"
                      models={IELTS}
                  />
                  <ModelsSection
                      id="image-section"
                      title="Image"
                      subtitle="Generate images with AI"
                      models={ImageModels}
                  />
                  <ModelsSection
                      title="Assignments"
                      subtitle="Deadlines are approaching?"
                      models={AssignmentModels}
                  />
                  <ModelsSection
                      title="Bots"
                      subtitle="Use specialized AI tools for specific tasks"
                      models={Bots}
                  />
                  {/* <ModelsSection
                      title="Video"
                      subtitle="Find, evaluate, interpret, and visualize information"
                      models={VideoModels}
                  /> */}
                </div>
              )}
            </div>
            {isPopUpOpen && <BkashPayment onClose={() => setIsPopUpOpen(false)} />}
        </div>
    )
}

export default Dashboard;

const SettingsDropdown = () => {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const [referralCoupon, setReferralCoupon] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  
  // Fetch referral coupon when the component loads
  useEffect(() => {
    async function fetchReferralCoupon() {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/referral?email=${session.user.email}`);
          const data = await response.json();

          if (response.ok && data.referralCoupon) {
            setReferralCoupon(data.referralCoupon);
          } else {
            setReferralCoupon('Not available');
          }
        } catch (error) {
          console.error('Failed to fetch referral coupon:', error);
          setReferralCoupon('Error fetching coupon');
        }
      }
    }

    fetchReferralCoupon();
  }, [session?.user?.email]);

  const handleCopy = () => {
    if (referralCoupon) {
      navigator.clipboard.writeText(referralCoupon);
      toast.success('Referral coupon copied to clipboard!', {
        duration: 3000,
      });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='text-2xl cursor-pointer'>
          <GoGear />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {session?.user?.email && (
          <>
            <DropdownMenuItem disabled className="opacity-70">
              {session.user.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Referral Coupon:
            </span>
            {referralCoupon ? (
              <div role="button"
                className="flex items-center gap-2 text-sm font-medium text-right text-teal-600 dark:text-teal-400"
                onClick={handleCopy}
              >
                <span className="truncate">{referralCoupon}</span>
                <Copy className="w-4 h-4 cursor-pointer" />
              </div>
            ) : (
              <span className="text-sm text-gray-500">Loading...</span>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            type="button"
            className="w-full cursor-pointer"
            onClick={() => {
              signOut({
                redirectTo: '/login',
              });
            }}
          >
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Update the props for ModelPopUp to accept a model object
interface ModelPopUpProps {
  onClose: () => void;
  model: Model;
}

  const ModelPopUp: React.FC<ModelPopUpProps> = ({ onClose, model }) => {
    const router = useRouter();

    return(
    <div className="fixed inset-0 flex items-center justify-center bg-black dark:bg-white bg-opacity-50 dark:bg-opacity-20 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ delay: 0 }}
        className='w-full flex justify-center'
      >
        <div className="bg-white dark:bg-neutral-950 py-6 px-10 border border-input rounded-lg shadow-lg w-full md:w-1/3 mx-3">
            <div className='flex justify-end gap-3 text-xl'> 
                <div className='rounded-full hover:bg-muted'><BsThreeDots/></div>
                <div onClick={onClose} className='rounded-full hover:bg-muted'><RxCross2/></div>
                 
            </div>
            <div className='flex justify-center text-6xl md:text-8xl py-2'>
              {model.src ? (
              <img src={model.src} alt={model.name} className="w-32 h-32 object-contain" />
              ) : (
              <div >{model.icon}</div>
              )}
            </div>
            <div className='flex justify-center text-xl font-bold mb-1'>{model.name}</div>
            <div className='flex justify-center text-muted mb-1'>By {model.provider}</div>
            <div className='flex justify-center mb-6 text-sm'>{model.description}</div>
            <div className=' mb-1 text-xl '>Capabilities</div>  

            <div className='mb-6'>
              {model.capabilities && model.capabilities.map((capability, index) => (
                <div key={index} className="flex items-center gap-2 text-sm mb-2">
                  <div className="text-green-400"><FaCheck /></div>
                  <div>{capability}</div>
                </div>
              ))}
            </div>
            <div className="flex">
            {model.upcoming ? (
        <button
          type="button"
          className="bg-gray-500 text-white px-4 py-2 rounded text-md w-full flex justify-center items-center gap-2 cursor-not-allowed"
        >
          <div>Coming Soon</div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => router.push(model.url)}
          className="bg-[#1B65A7] hover:bg-[#145083] active:bg-[#0F3A63] text-white px-4 py-2 rounded text-md w-full flex justify-center items-center gap-2"
        >
          <div className='text-xl'><IoChatbubbleOutline/></div>
          <div>Start Chat</div>
        </button>
      )}
          </div>
        </div>
      </motion.div>
    </div>
    );

}


// Define a model type for clarity
interface Model {
  id: string;
  name: string;
  icon?: React.ReactNode;
  src?: string;
  description: string;
  capabilities?: string[];
  provider?: string;
  url: string;
  upcoming?: boolean;
}
  

interface ModelCardInterface {
  model: Model;
}

const ModelCard: React.FC<ModelCardInterface> = ({ model }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Check if the text is overflowing its container
  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(
        textRef.current.scrollHeight > textRef.current.clientHeight
      );
    }
  }, []);

  const [isModelPopUpOpen, setIsModelPopUpOpen] = useState(false);
  const openModelPopUp = async () => {
    setIsModelPopUpOpen(true);

    // Log user's interest to DB
    try {
      // Call the API to log usage
      await fetch("/api/user-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modelId: model.id }),
      });
    } catch (error) {
      console.error("User interest failed:", error);
    }
  };

  return (
    <div>
      <div
        className="w-full flex p-2 bg-muted rounded-2xl hover:bg-transparent hover:border hover:border-input"
        onClick={openModelPopUp}
      >
        <div className="text-6xl md:text-8xl flex items-center md:px-4">
          {model.src ? (
            <img
              src={model.src}
              alt={model.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div>{model.icon}</div>
          )}
        </div>
        <div className="py-2 px-2 min-h-24 md:min-h-40">
          <div className="text-xl pb-2 font-semibold">{model.name}</div>
          <div
            ref={textRef}
            className={`text-muted-foreground ${
              isExpanded ? "" : "line-clamp-2 md:line-clamp-3 overflow-hidden"
            }`}
          >
            {model.description}
          </div>
          {isOverflowing && (
            <button
              className="hover:underline text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
      </div>
      {isModelPopUpOpen && (
        <ModelPopUp
          onClose={() => setIsModelPopUpOpen(false)}
          model={model}
        />
      )}
    </div>
  );
};

// Props for the ChatModelsSection component
interface ChatModelsSectionProps {
    id?: string; // Optional id prop for the section
    title: string;
    subtitle: string;
    models: Model[];
  }
  // ChatModelsSection component accepts variables for title, subtitle and models array.
const ModelsSection: React.FC<ChatModelsSectionProps> = ({
    id,
    title,
    subtitle,
    models,
  }) => {
    return (
      <div className='pb-12' id={id}>
        <div className="px-3 w-full flex justify-center">
          <div className="w-full md:w-2/3 pb-3">
            <div className="text-2xl pb-1">{title}</div>
            <div className="text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        <div className="px-3 w-full flex justify-center">
          <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </div>
      </div>
    );
  };


  const ModelsSectionSingleRow: React.FC<ChatModelsSectionProps> = ({
    id,
    title,
    subtitle,
    models,
  }) => {
    return (
      <div className='pb-12' id={id}>
        <div className="px-3 w-full flex justify-center">
          <div className="w-full md:w-2/3 pb-3">
            <div className="text-2xl pb-1">{title}</div>
            <div className="text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        <div className="px-3 w-full flex justify-center">
          <div className="w-full md:w-2/3 flex flex-col gap-4">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </div>
      </div>
    );
  };


  interface ImageCarouselProps {
    images: string[];
    interval?: number; // Auto-rotate interval in milliseconds (default: 5000)
  }
  
  const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, interval = 5000 }) => {
    const [current, setCurrent] = useState(0);
    
    // Auto-rotate images periodically with a sliding effect
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, interval);
      return () => clearInterval(timer);
    }, [images.length, interval]);
  
    // Functions for manual navigation
    const prevImage = () => {
      setCurrent((prev) => (prev - 1 + images.length) % images.length);
    };
  
    const nextImage = () => {
      setCurrent((prev) => (prev + 1) % images.length);
    };
  
    // Function to handle "Try out now" button click based on current image
    const handleTryOutClick = () => {
      // Scroll to the corresponding section based on current image
      const sections = ["chat-section", "image-section", "ielts-section"];
      const sectionId = sections[current];
      
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };
  
    return (
      <div className="relative w-full h-full overflow-hidden rounded-3xl">
        {/* Sliding images container */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img src={image} alt={`Slide ${index}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
  
        {/* Navigation Buttons */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
        >
          &#9664;
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
        >
          &#9654;
        </button>
  
        {/* Dots Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, idx) => (
            <span
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2 h-2 rounded-full cursor-pointer ${idx === current ? "bg-white" : "bg-gray-500"}`}
            ></span>
          ))}
        </div>
  
        {/* Overlay "Try out now" Button in Bottom Right */}
        <button 
          onClick={handleTryOutClick}
          className="absolute bottom-4 right-4 bg-[#1B65A7] text-white px-4 py-2 rounded text-md hover:bg-[#145083] active:bg-[#0F3A63]"
        >
          Try out now
        </button>
      </div>
    );
  };
  
  