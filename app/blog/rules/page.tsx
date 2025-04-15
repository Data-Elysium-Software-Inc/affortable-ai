import BlogPage from '@/components/blog';

export default function RulesPage() {
  return (
    <BlogPage
      title="Take the Quiz Challenge – Show Your Skills!"
      subtitle="Simple Rules, Big Rewards!"
      image=""
      content={
        <>
          <p>Quiz-এ অংশগ্রহণ করে জিততে হলে নিচের শর্তগুলো পূরণ করতে হবে:</p>
          <ul className="ml-5 list-none space-y-2">
            <li>1️⃣ Poll-এ ভোট দিন।</li>
            <li>2️⃣ ভোট দেওয়ার পর Quiz পোস্টে “Completed” লিখে কমেন্ট এবং রিঅ্যাক্ট করুন।</li> 
            <li>
              3️⃣ আমাদের{" "}
              <a
                href="https://www.facebook.com/profile.php?id=61559562616655"
                target="_blank"
                rel="noopener noreferrer"
                className='text-blue-600 underline dark:text-blue-400'
              >
                Data-Elysium
              </a>{" "}
              পেজে লাইক দিন।
            </li>
          </ul>
          <p className="mt-4">
            <strong>❗ N.B.:</strong>
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li><strong>Fake account থেকে কোনো উত্তর গ্রহণযোগ্য হবে না।</strong></li>
            <li>Fake account-এর প্রমাণ পাওয়া গেলে আপনার অংশগ্রহণ <strong>বাতিল</strong> করা হবে।</li>
          </ul>
          
          <p><strong>নিয়ম মেনে অংশ নিন এবং পুরস্কার জিতে নিন!</strong> 🌟</p>
        </>

      }
    />
  );
}
