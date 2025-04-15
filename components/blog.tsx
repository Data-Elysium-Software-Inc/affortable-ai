import React from 'react';
import Image from 'next/image';

interface BlogPageProps {
  title: string;
  subtitle: string;
  image: string;
  content: React.ReactNode;
}

export default function BlogPage({ title, subtitle, image, content }: BlogPageProps) {
  return (
    <article className="prose max-w-none text-black dark:prose-invert dark:text-gray-100">
      {/* Title */}
      <h2 className="mb-2 text-2xl font-bold">{title}</h2>

      {/* Subtitle */}
      <p className="mb-4 font-bold text-gray-600 dark:text-gray-400">{subtitle}</p>

      {/* Render Image if input is not empty */}
      {image && (
        <div className="my-6 flex justify-center">
        <Image
          src={image}
          alt={title}
          width={800}
          height={600}
          style={{
            maxWidth: "100%",  
            width: "auto",    
            height: "auto",     
          }}
          className="rounded-md border border-gray-300 shadow-sm dark:border-gray-700 object-contain"
        />
        </div>
      )}

      {/* Content */}
      <div>{content}</div>
    </article>
  );
}
