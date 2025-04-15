
// import { put } from "@vercel/blob";
// import { NextResponse } from "next/server";
// import { z } from "zod";

// import { auth } from "@/app/(auth)/auth";

// // Use Blob instead of File since File is not available in Node.js environment
// const FileSchema = z.object({
//   file: z
//     .instanceof(Blob)
//     .refine((file) => file.size <= 25 * 1024 * 1024, {
//       message: "File size should be less than 25MB",
//     })
//     // Update the file type based on the kind of files you want to accept
//     .refine(
//       (file) =>
//         ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
//       {
//         message: "File type should be JPEG or PNG or PDF",
//       }
//     ),
// });

// export async function POST(request: Request) {
//   const session = await auth();

//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   if (request.body === null) {
//     return new Response("Request body is empty", { status: 400 });
//   }

//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as Blob;

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     const validatedFile = FileSchema.safeParse({ file });

//     if (!validatedFile.success) {
//       const errorMessage = validatedFile.error.errors
//         .map((error) => error.message)
//         .join(", ");

//       return NextResponse.json({ error: errorMessage }, { status: 400 });
//     }

//     // Get filename from formData since Blob doesn't have name property
//     const filename = (formData.get("file") as File).name;
//     const fileBuffer = await file.arrayBuffer();

//     try {
//       const data = await put(`${filename}`, fileBuffer, {
//         access: "public",
//       });

//       return NextResponse.json(data);
//     } catch (error) {
//       // console.error(error);
//       return NextResponse.json({ error: "Upload failed" }, { status: 500 });
//     }
//   } catch (error) {
//     // console.error(error);
//     return NextResponse.json(
//       { error: "Failed to process request" },
//       { status: 500 }
//     );
//   }
// }


import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

export async function POST(request: Request) {
  // Authenticate the user
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Expecting JSON body
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  try {
    // Use handleUpload from @vercel/blob/client
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Optionally validate the pathname or clientPayload using zod
        // For example, to validate filename:
        const PathSchema = z.string().refine((path) => {
          // Add your custom validation logic for the path here
          // For example, ensure the filename has an allowed extension
          return /\.(jpe?g|png|pdf)$/i.test(path);
        }, "Invalid file type");

        const pathValidation = PathSchema.safeParse(pathname);
        if (!pathValidation.success) {
          throw new Error("Invalid file path");
        }

        // Generate client token with allowed content types and maximum size
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "application/pdf",
          ],
          maximumSize: 25 * 1024 * 1024, // 25MB
          tokenPayload: JSON.stringify({
            userId: session?.user?.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Handle upload completion
        // const { userId } = JSON.parse(tokenPayload);

        // You might want to save the blob URL or other metadata to your database
        try {
          // Example: Save the uploaded file URL to the user's profile
          // await db.user.update({
          //   where: { id: userId },
          //   data: { uploadedFileUrl: blob.url },
          // });
          console.log("Upload completed:", blob.url);
        } catch (error) {
          throw new Error("Could not update user data");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}