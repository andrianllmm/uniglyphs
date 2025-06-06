import Link from "next/link";
import { H2, P } from "@workspace/ui/components/heading-with-anchor";
import { Button } from "@workspace/ui/components/button";

export default function NotFound() {
  return (
    <div className="my-2 flex flex-col gap-2 items-center justify-center">
      <H2 className="text-3xl">Oops� Page Not Found</H2>
      <P>The page you’re looking for doesn’t exist.</P>
      <Button size="sm" asChild>
        <Link href="/">Go Back Home</Link>
      </Button>
    </div>
  );
}
