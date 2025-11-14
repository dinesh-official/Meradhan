"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaSignature } from "react-icons/fa";
import SignDoNotDO, { signDrawGuidelines, signUploadGuidelines } from "../_dialogs/SignDoNotDO";
import { useSignVerifyHook } from "./_hooks/useSignVerifyHook";

export default function IdentityValidationAddSign() {
  const { handelSignVerification, isPending } = useSignVerifyHook();
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Add Your Signature</CardTitle>
      </CardHeader>

      <CardContent accountMode>
        <div className="flex flex-col gap-4">
          <p>
            A signature is required as per SEBI regulations to access bond
            investments.
          </p>

          <Section
            title="Before You Proceed:"
            content="Please review the following guidelines:"
          />

          <Section title="If You Are Uploading Your Signature:">
            <ul className="mt-2 ml-8 list-disc">
              <li className="text-primary">
                <SignDoNotDO data={signUploadGuidelines} title="Signature Upload – Do’s & Don’ts" >Do’s and Don’ts for signature upload</SignDoNotDO>
              </li>
            </ul>
          </Section>

          <Section title="If You Are Drawing Your Signature On-Screen:">
            <ul className="mt-2 ml-8 list-disc">
              <li className="text-primary">
                <SignDoNotDO data={signDrawGuidelines} title="Signature Draw (On-Screen) – Do’s & Don’ts">
                  Do’s and Don’ts for drawing your signature
                </SignDoNotDO>
              </li>
            </ul>
          </Section>
        </div>
      </CardContent>

      <CardFooter accountMode className="sm:flex-row flex-col gap-1 lg:mt-2">
        <Button
          className="w-full lg:w-auto "
          onClick={handelSignVerification}
          disabled={isPending}
        >
          Add Signature <FaSignature />
        </Button>
      </CardFooter>
    </Card>
  );
}

function Section({
  title,
  content,
  children,
}: {
  title: string;
  content?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      {content && <p>{content}</p>}
      {children}
    </div>
  );
}
