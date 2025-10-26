import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OngoingDealList } from "./OngoingDealList";

function OngoingDealsCard() {
  return (
    <Card className="border-gray-200 rounded-lg min-h-96" role="region">
      <CardHeader>
        <CardTitle className="font-medium text-2xl">
          Ongoing <span className="text-secondary">Deals</span>
        </CardTitle>
        <CardDescription className="text-base">
          Discover ongoing bond deals with exclusive offers — available for a
          limited time on MeraDhan!
        </CardDescription>
      </CardHeader>

      <CardContent className="">
        <OngoingDealList></OngoingDealList>
        <OngoingDealList></OngoingDealList>
        <OngoingDealList></OngoingDealList>
        <OngoingDealList></OngoingDealList>
        <OngoingDealList></OngoingDealList>
        <OngoingDealList></OngoingDealList>
      </CardContent>
    </Card>
  );
}

export default OngoingDealsCard;
