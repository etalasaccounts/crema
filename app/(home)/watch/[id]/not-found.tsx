import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-5">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This video could not be found. It may have been deleted or you don't have permission to view it.
        </AlertDescription>
      </Alert>
    </div>
  );
}