import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export function RecentBlogCard() {
  return (
    <Card className="pt-0 overflow-hidden min-h-96">
      <Image
        src={`/avatars/blogpage.png`}
        alt="blog"
        width={1200}
        height={800}
        className="w-full h-52 object-cover"
      />
      <CardContent>
        <div className="flex flex-col gap-3">
          <Badge>Educative</Badge>
          <p className="text-xl text-primary">
            What Is Yield in Bonds and How Is It Calculated?
          </p>
        </div>
      </CardContent>
    </Card>
  );
}