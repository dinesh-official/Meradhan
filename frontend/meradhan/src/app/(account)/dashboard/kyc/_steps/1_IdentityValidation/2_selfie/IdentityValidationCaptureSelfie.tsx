"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { MdOutlineCameraAlt } from "react-icons/md";
import { useSelfieVerifyHook } from "./_hooks/useSelfieVerifyHook";
import { useEffect } from "react";

function IdentityValidationCaptureSelfie() {
  const { handelSelfieVerification, isPending } = useSelfieVerifyHook();

  async function requestLocationPermission(): Promise<GeolocationPosition | null> {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation is not supported by this browser.");
      return null;
    }

    try {
      // Some browsers support Permission API
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });

        if (permissionStatus.state === "denied") {
          console.error("Location permission is denied.");
          return null;
        }
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      return position;
    } catch (err) {
      console.error("Failed to get location:", err);
      return null;
    }
  }

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Capture Your Selfie</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <KycSelfieGuide />
      </CardContent>
      <CardFooter accountMode>
        <Button
          className="w-full lg:w-auto"
          onClick={handelSelfieVerification}
          disabled={isPending}
        >
          Take Your Selfie <MdOutlineCameraAlt />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationCaptureSelfie;

export function KycSelfieGuide() {
  return (
    <div className="gap-10 lg:grid grid-cols-2">
      <div className="flex flex-col gap-3.5 text-sm">
        <p>
          A selfie is required as per SEBI guidelines to proceed with investing
          in Bonds.
        </p>
        <p>
          We’ll use this selfie to verify your identity by comparing it with
          your submitted documents.
        </p>
        <p>Before you proceed, please ensure:</p>
        <ul className="flex flex-col gap-2 pl-5 list-disc">
          <li>
            you are not wearing a cap, hat, or head covering (unless for
            religious reasons).
          </li>
          <li>you have removed any glasses or sunglasses.</li>
          <li>
            your face is fully visible — avoid wearing a mask or anything
            covering your face.
          </li>
          <li>you are in a well-lit area for a clear and accurate capture.</li>
          <li>your device’s location is turned on.</li>
          <li>
            you allow MeraDhan to access your device’s camera and location when
            prompted.
          </li>
        </ul>
      </div>
      <HintAllowSelfie />
    </div>
  );
}

function HintAllowSelfie() {
  return (
    <div className="flex flex-col gap-8 mt-10 lg:mt-0">
      <div className="flex flex-col gap-2">
        <p className="font-bold text-lg">Don’ts</p>
        <Image
          src="/static/kyc/disallowFace.svg"
          alt="disallowFace"
          width={350}
          height={300}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-bold text-lg">Do’s</p>
        <Image
          src="/static/kyc/allowFace.svg"
          alt="allowFace"
          width={100}
          height={100}
        />
      </div>
    </div>
  );
}
