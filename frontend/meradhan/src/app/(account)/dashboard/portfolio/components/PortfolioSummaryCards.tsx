import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SummaryItem {
  title: string;
  value: string;
}

interface Props {
  data: SummaryItem[];
}

export default function PortfolioSummaryCards({ data }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-6 gap-3 four-card-wrapper">
      {data.map((item, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-[13px] md:text-[16px] text-[#000000] font-normal">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[18px] md:text-[24px] text-[#002C59] font-medium">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}