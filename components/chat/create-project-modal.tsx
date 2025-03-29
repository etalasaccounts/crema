import React from "react";

import { useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { useSupabase } from "@/hooks/use-supabase";
import { useOpenAI } from "@/hooks/use-openai";

import { createClient } from "@/lib/supabase/client-browser";
import { createAssistant } from "@/lib/openai/assistant";

// Components
import { toast } from "sonner";
import { BadgeInfo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Form & Validations
import { useForm } from "react-hook-form";
import { assistantSchema, AssistantInput } from "@/lib/validations/assistant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Assistant } from "@/types/supabase";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { insert: insertProject } = useSupabase<any>("projects");

  const form = useForm<AssistantInput>({
    resolver: zodResolver(assistantSchema),
    defaultValues: {
      name: "",
      model: "gpt-4-turbo-preview",
    },
  });

  const handleCreateProject = async (input: AssistantInput) => {
    // Loading starts
    setIsLoading(true);
    try {
      // Create Assistant in OpenAI
      const assistantResult = await createAssistant(input);
      if (assistantResult) {
        // Initialize Supabase client
        const supabase = await createClient();
        // Store assistant to Supabase
        const { data: assistantData, error: assistantError } = await supabase
          .from("assistants")
          .insert({
            name: input.name,
            model: input.model,
            assistant_id: assistantResult,
            // workspace_id: user?.active_workspace,
          })
          .select()
          .single();

        // Type assertion for returned assistant
        const typedAssistantData = assistantData as Assistant | null;
        // If assistant is creation fails then show error toast
        if (assistantError) {
          toast.error("Failed to create assistant.");
          return;
        }
        // If assistant is created successfully then redirect to project
        if (typedAssistantData?.id) {
          router.push(`/d/project/${typedAssistantData.id}`);
        }
        // Close modal
        onClose();
      }
    } catch (error) {
      toast.error("Failed to create project.");
    } finally {
      form.reset();
      // Loading ends
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg [&>button]:hidden ">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Project</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleCreateProject)}
          className="flex flex-col gap-4"
        >
          <div>
            <Input
              {...form.register("name")}
              placeholder="Enter your project name..."
              className="h-11 text-base"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className=" flex gap-2 bg-muted p-3 rounded-md">
            <BadgeInfo className="size-5" />
            <div className="flex flex-col w-full gap-0.5 text-secondary-foreground">
              <p className="text-sm font-medium ">What's a project?</p>
              <p className="text-sm">
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                eiusmod tempor incididunt.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button loading={isLoading} type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
