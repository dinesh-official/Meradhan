import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useFollowUpApiHook } from "../useFollowUpApiHook";

interface FollowUpMessageCard {
  name: string;
  message: string;
  date: string;
  leadFollowUpId: number;
}
const FollowUpMessageCard = (followUPMessageFormData: FollowUpMessageCard) => {
  const { deleteFollowUpNotes } = useFollowUpApiHook();
  return (
    <Card className="bg-gray-100 border-0">
      <CardHeader className=" items-center">
        <CardTitle className="">{followUPMessageFormData.name}</CardTitle>
        <CardAction
          onClick={() => {
            deleteFollowUpNotes.mutate(followUPMessageFormData.leadFollowUpId);
          }}
        >
          <Trash2 className="h-4 w-4 text-red-600 cursor-pointer" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm">
          {followUPMessageFormData.message}
        </p>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        {followUPMessageFormData.date}
      </CardFooter>
    </Card>
  );
};

export default FollowUpMessageCard;
