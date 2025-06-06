import { Spinner } from "@workspace/ui/components/spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center">
      <Spinner className="m-4 text-primary/80" />
    </div>
  );
}
