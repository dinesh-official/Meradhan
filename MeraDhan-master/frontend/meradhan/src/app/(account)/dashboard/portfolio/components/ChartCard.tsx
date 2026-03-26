import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, children }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[22px] font-normal text-[#000000]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}