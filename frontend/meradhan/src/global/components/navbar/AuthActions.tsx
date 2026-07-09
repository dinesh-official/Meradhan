import { ShowUserBadge } from "@/app/(account)/_components/NavBar/AccountNavBar";
import { Button } from "@/components/ui/button";
import { ISessionResponse } from "@root/apiGateway";
import Link from "next/link";
function AuthActions({
  session,
}: {
  session: ISessionResponse["responseData"] | null;
}) {
  if (session) {
    return ShowUserBadge(session);
  }

  return (
    <>
      <Link href="/login" className="">
        Login
      </Link>
      <Link href={`/signup`}>
        <Button className="px-5">Sign Up</Button>
      </Link>
    </>
  );
}

export default AuthActions;
