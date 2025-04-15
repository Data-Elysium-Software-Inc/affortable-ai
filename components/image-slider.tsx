import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageSliderProps {
    images: string[];
    onSlideChange?: (index: number) => void; // 🔹 Add a callback function to update the current index
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, onSlideChange }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (onSlideChange) {
            onSlideChange(currentIndex); // 🔹 Notify parent of slide change
        }
    }, [currentIndex, onSlideChange]);

    if (!images || images.length === 0) return <p className="text-center">No images available.</p>;

    const nextSlide = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    const prevSlide = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);

    return (
        <div className="relative w-full max-w-lg mx-auto">
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800 text-white rounded-full shadow-lg"
            >
                ❮
            </button>

            <Image
                src={images[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                width={400}
                height={400}
                className="rounded-lg shadow-md h-full w-full object-cover"
            />

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800 text-white rounded-full shadow-lg"
            >
                ❯
            </button>
        </div>
    );
};

export default ImageSlider;