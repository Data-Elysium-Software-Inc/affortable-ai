import BlogPage from "@/components/blog";
import React from "react";

export default function QuizPage() {
  return (
    <BlogPage
      title="Data Elysium AI Quiz: Prize Pool of BDT 3 Lacs"
      subtitle="Earn BDT 100 by simply voting in Quiz Polls"
      image="/images/blog/quiz-image.png"
      content={
        <div className="text-justify">
          <p>
            What makes humanity truly unique? It’s our ability to create tools
            and collaborate on a massive scale. Over the years, the internet and
            globalization have transformed our world, bringing us closer than
            ever and reshaping how we live—socially, financially, and beyond.
          </p>
          <p>
            The internet has unlocked a digital universe where information flows
            freely. But let’s face it: navigating this overwhelming sea of data
            isn’t always easy. Finding reliable, useful information can feel
            like searching for a needle in a haystack. That’s where technology
            steps in. Think of Google—it revolutionized how we search, turning
            chaos into clarity.
          </p>
          <p>
            Now, we’re on the verge of something even more transformative: Large
            Language Models (LLMs). These tools don’t just simplify and
            summarize complex information—they’re also accelerating the
            automation of traditional jobs. About 70% of workforce tasks
            (McKinsey) that are repetitive and menial tasks, once considered
            essential, are now becoming obsolete due to advancements in AI. As
            Larry Page, former CEO of Google said in 2000,
          </p>
          <blockquote>
            &#34;Artificial intelligence will be the ultimate version of Google.
            So, if we had the ultimate search engine, it would understand
            everything on the web, it would understand exactly what you wanted
            and it would give you the right thing. That&#39;s obviously
            Artificial intelligence.&#34;
          </blockquote>
          <p>
            From data entry to customer support, these roles are being replaced
            by smarter, more efficient systems, fundamentally reshaping the job
            market.
          </p>
          <p>
            Despite this global shift, many in Bangladesh remain unaware of
            these changes. Surveys reveal that a significant portion of the
            population still clings to traditional jobs, unaware that automation
            is gradually phasing them out. This knowledge gap puts them at risk
            of being left behind in a rapidly evolving world.
          </p>
          <p>
            That’s where our non-profit programs step in. One of our key
            initiatives is a specially designed quiz to challenge and engage the
            people of Bangladesh. The purpose isn’t just to test knowledge—it’s
            to enlighten. This quiz aims to show how the jobs many rely on for
            survival, or aspire to secure, are disappearing in the face of
            automation. It emphasizes the urgent need to embrace AI and adapt to
            new realities. Without this shift, surviving in the future workforce
            will become increasingly difficult.
          </p>
          <p>
            Our vision is clear: to educate, empower, and prepare Bangladesh for
            the digital age. By raising awareness and fostering adaptability, we
            aim to equip individuals with the tools they need to thrive. When
            technology becomes a partner in growth rather than a threat, the
            possibilities are boundless.
          </p>

          <h3>Important Resources:</h3>
          <ol className="ml-5 space-y-2">
            <li>
              Sign up to{" "}
              <a
                href="https://affortable.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                affortable.ai
              </a>{" "}
              to avail $1 Free Credit.
            </li>
            <li>
              Sign up and get transcription credit (no credit cards required)
              for state-of-the-art{" "}
              <a
                href="https://voice-transcribe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                voice transcription service
              </a>
              .
            </li>
            <li>Get Free 10-hour transcription API credit.</li>
            <li>
              Visit for developer jobs:{" "}
              <a
                href="https://data-elysium.ca/career"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                https://data-elysium.ca/career
              </a>
              .
            </li>
          </ol>
        </div>
      }
    />
  );
}
