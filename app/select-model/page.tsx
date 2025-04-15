"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveModelId } from "@/app/(chat)/actions";
import { models } from "@/lib/ai/models";
import { Loader2 } from "lucide-react";

function ModelSetter() {
    const searchParams = useSearchParams();
    const modelId = searchParams.get("model-id");
    const router = useRouter();
    const [status, setStatus] = useState("Initializing...");

    useEffect(() => {
        async function handleModelChange() {
            if (!modelId) {
                setStatus("No model ID provided");
                setTimeout(() => router.replace("/"), 1000);
                return;
            }
            
            const modelExists = models.some((model) => model.id === modelId);
            if (!modelExists) {
                setStatus("Invalid model ID, redirecting...");
                setTimeout(() => router.replace("/"), 1000);
                return;
            }
            
            try {
                // setStatus("Saving model preference...");
                await saveModelId(modelId);
                // setStatus("Redirecting to home...");
                
                // Force redirect with window.location as a fallback
                window.location.href = "/?stay=true";
            } catch (error) {
                console.error("Error saving model:", error);
                setStatus("Error occurred, redirecting...");
                setTimeout(() => window.location.href = "/", 1000);
            }
        }
        
        handleModelChange();
    }, [modelId, router]);
      
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-foreground" />
            <p>{status}</p>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ModelSetter />
        </Suspense>
    );
}