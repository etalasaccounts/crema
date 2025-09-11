"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      // Create checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
        }),
      });

      const { sessionId, url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to start checkout process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        { name: "Up to 5 minutes video length", included: true },
        { name: "Basic video quality", included: true },
        { name: "Videos deleted after 30 days", included: true },
        { name: "Limited storage", included: true },
        { name: "Upload videos", included: false },
        { name: "HD Quality", included: false },
        { name: "Unlimited videos", included: false },
        { name: "Persistent storage", included: false },
      ],
      current: true,
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
    },
    {
      name: "Premium",
      price: "$20.00",
      period: "month",
      description: "For power users and professionals",
      features: [
        { name: "Unlimited video length", included: true },
        { name: "HD video quality", included: true },
        { name: "Unlimited video storage", included: true },
        { name: "Upload videos", included: true },
        { name: "Priority support", included: true },
      ],
      current: false,
      buttonText: "Upgrade to Premium",
      buttonVariant: "default" as const,
      popular: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upgrade to Premium to unlock unlimited video creation, HD quality, and
          persistent storage.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.popular ? "border-primary shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-base">
                {plan.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">
                  /{plan.period}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        !feature.included
                          ? "text-muted-foreground line-through"
                          : ""
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.buttonVariant}
                disabled={plan.current || loading}
                onClick={plan.name === "Premium" ? handleUpgrade : undefined}
              >
                {loading && plan.name === "Premium" ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin [animation-duration:1000ms]" />
                    Processing...
                  </>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="bg-muted/50 rounded-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Need help choosing?</h3>
          <p className="text-muted-foreground mb-6">
            Start with our free plan and upgrade anytime when you need more
            features. No long-term commitments required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">Contact Support</Button>
            <Button variant="ghost">View FAQ</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
