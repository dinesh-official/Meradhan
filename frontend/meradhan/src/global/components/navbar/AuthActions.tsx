import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ISessionResponse } from "@root/apiGateway";
import Link from "next/link";
function AuthActions({
  session,
}: {
  session: ISessionResponse["responseData"] | null;
}) {
  if (session) {
    return (
      <Avatar>
        <AvatarFallback>
          {session.firstName?.slice(0, 1)} {session.lastName?.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <>
      <Link href="/login" className="text-gray-700">
        Login
      </Link>
      <Link href={`/signup`}>
        <Button className="px-5">Sign Up</Button>
      </Link>
    </>
  );
}

export default AuthActions;
