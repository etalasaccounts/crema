"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, CheckCircle, XCircle } from "lucide-react";

type PaymentStatus = "loading" | "success" | "error" | "cancelled";

function BillingStatusContent() {
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [message, setMessage] = useState("Processing your payment...");
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("No session ID found. Please try again.");
      return;
    }

    // Poll for payment status
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/stripe/session-status?session_id=${sessionId}`
        );
        const data = await response.json();

        if (data.status === "complete") {
          setStatus("success");
          setMessage(
            "Payment successful! Your account has been upgraded to Premium."
          );
        } else if (data.status === "expired") {
          setStatus("error");
          setMessage("Payment session expired. Please try again.");
        } else {
          // Continue polling
          setTimeout(checkPaymentStatus, 2000);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setStatus("error");
        setMessage("An error occurred while processing your payment.");
      }
    };

    // Start polling after a short delay
    const timeoutId = setTimeout(checkPaymentStatus, 1000);

    return () => clearTimeout(timeoutId);
  }, [sessionId]);

  const getIcon = () => {
    switch (status) {
      case "loading":
        return (
          <Loader className="h-16 w-16 animate-spin text-blue-500 [animation-duration:1000ms]" />
        );
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "error":
      case "cancelled":
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return (
          <Loader className="h-16 w-16 animate-spin text-blue-500 [animation-duration:1000ms]" />
        );
    }
  };

  const getTitle = () => {
    switch (status) {
      case "loading":
        return "Processing Payment";
      case "success":
        return "Payment Successful!";
      case "error":
        return "Payment Failed";
      case "cancelled":
        return "Payment Cancelled";
      default:
        return "Processing Payment";
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">{getIcon()}</div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription className="text-lg">{message}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please don&apos;t close this page while we process your payment.
              </p>
              <p className="text-sm text-muted-foreground">
                This may take a few moments...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  Welcome to Premium!
                </h3>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Unlimited video length</li>
                  <li>• HD video quality</li>
                  <li>• Persistent video storage</li>
                  <li>• Unlimited video uploads</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => router.push("/home")}>
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/billing")}
                >
                  View Billing
                </Button>
              </div>
            </div>
          )}

          {(status === "error" || status === "cancelled") && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  {status === "cancelled"
                    ? "Your payment was cancelled. No charges were made to your account."
                    : "There was an issue processing your payment. Please try again or contact support if the problem persists."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => router.push("/billing")}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => router.push("/home")}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <Loader className="h-16 w-16 animate-spin text-blue-500" />
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
              <CardDescription className="text-lg">
                Please wait while we load your payment status.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <BillingStatusContent />
    </Suspense>
  );
}
