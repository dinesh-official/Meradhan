import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IoMdArrowDropright } from "react-icons/io";

function AdharInfoForm() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Let’s Verify Your Aadhaar</CardTitle>
      </CardHeader>

      <CardContent accountMode></CardContent>

      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="flex items-center gap-1 w-full sm:w-auto">
          Verify Aadhaar
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>

        <Button variant="link" onClick={async () => {}}>
          Save & Exit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdharInfoForm;
