import ViewPort from "@/global/components/wrapper/ViewPort";
import Image from "next/image";
import Link from "next/link";

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
          className="w-96 h-auto"
        />

        <p className="text-gray-600 max-w-md">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link className="px-6 text-secondary rounded-xl" href={"/"}>
          Go Back Home
        </Link>
      </div>
    </ViewPort>
  );
}
