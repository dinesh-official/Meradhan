import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { MdOutlineArrowRight } from "react-icons/md";

function IdentityValidationSelfiePreview() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Confirm Selfie</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex items-center gap-5">
          <Image
            src="/avatars/person.jpeg"
            alt="PAN Card"
            width={1140}
            height={597}
            className="bg-gray-50 rounded-2xl w-48 object-cover aspect-[3/4]"
          />
          <div>
            <p className="font-medium text-primary text-lg">Recapture</p>
            <p className="text-gray-600 text-sm">(Instructions)</p>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5 lg:mt-5">
        <Button className="w-full sm:w-auto">
          Continue To verify <MdOutlineArrowRight />
        </Button>
        <Button variant={`link`}>Save & Exit</Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationSelfiePreview;
