import ViewPort from "@/global/components/wrapper/ViewPort";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 0;

export const metadata = {
  title: "Page Not Found - MeraDhan",
  description:
    "Oops! The page you’re looking for doesn’t exist or has been moved. Go back to MeraDhan homepage.",
};

export default function NotFound() {
  return (
    <ViewPort>
      <div
        className={
          "flex h-[90vh] w-full flex-col items-center justify-center text-center gap-10 px-4"
        }
      >
        <Image
          src={"/page-not-found.svg"}
          width={1200}
          height={800}
          alt="No found"
          className="w-80 h-auto"
        />

        <p className="max-w-md text-gray-600">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link className="px-6 rounded-xl text-secondary" href={"/"}>
          Go Back Home
        </Link>
      </div>
    </ViewPort>
  );
}
