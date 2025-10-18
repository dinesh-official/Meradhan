import { Trash2 } from "lucide-react";
import { useFollowUpApiHook } from "../hooks/useFollowUpApiHook";

interface FollowUpMessageCardProps {
  name: string;
  message: string;
  date?: string;
  leadFollowUpId: number;
}

const FollowUpMessageCard = ({
  name,
  message,
  date,
  leadFollowUpId,
}: FollowUpMessageCardProps) => {
  const { deleteFollowUpNotes } = useFollowUpApiHook();

  return (
    <div className="  rounded-xl p-3 px-5 bg-gray-50 flex justify-between items-start ">
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-gray-600">{message}</p>
        <p className="text-sm text-gray-400">{date || "No Date"}</p>
      </div>
      <Trash2
        className="text-red-500 cursor-pointer hover:text-red-700 transition-colors duration-200"
        onClick={async () => {
          deleteFollowUpNotes.mutate(leadFollowUpId);
        }}
        size={20}
      />
    </div>
  );
};

export default FollowUpMessageCard;
