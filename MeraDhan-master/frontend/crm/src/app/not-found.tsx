"use client"
import { Button } from "@/components/ui/button";
import { useRouter } from "nextjs-toploader/app";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className={"flex h-[100vh] w-full flex-col items-center justify-center bg-[#F9FAFB] text-center px-4"}>
      <h1 className="text-9xl font-extrabold text-gray-300 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button variant={"link"} className="px-6 py-3 rounded-xl" onClick={router.back}>
        Go Back
      </Button>
    </div>
  );
}
