import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useOpenAI } from "@/hooks/use-openai";
import { useSupabase } from "@/hooks/use-supabase";
import { createClient } from "@/lib/supabase/client-browser";
import { updateAssistantInstruction } from "@/lib/openai/assistant";

import { Assistant } from "@/types/supabase";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InstructionModalProps {
  project: Assistant;
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionModal({
  project,
  isOpen,
  onClose,
}: InstructionModalProps) {
  // const { updateAssistantInstruction } = useOpenAI();
  // const { update: updateProject } = useSupabase<any>("projects");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Form
  const form = useForm<any>({
    defaultValues: {
      instruction: project?.description || "",
    },
  });

  // Tambahkan useEffect untuk update form values
  useEffect(() => {
    if (project) {
      form.reset({
        instruction: project.instruction || "",
      });
    }
  }, [project]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Update instruction
      const result = await updateAssistantInstruction({
        assistant_id: project.assistant_id,
        instruction: data.instruction, // Use form data instead of getValues
      });
      toast.success("Instruction updated successfully!");
      onClose();

      // Update project
      const { data: projectData, error: projectError } = await supabase
        .from("assistants")
        .update({
          instruction: data.instruction,
        })
        .eq("id", project.id)
        .select();

      if (projectError) {
        toast.error("Failed to update project.");
        console.error("Error updating project:", projectError);
      }
    } catch (error) {
      toast.error("Failed to update instruction.");
      console.error("Error updating instruction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Instruction</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-4">
            <Textarea
              {...form.register("instruction")}
              placeholder="Enter your instruction here..."
              className="w-full h-32 text-base"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              size={"sm"}
            >
              Cancel
            </Button>
            <Button
              variant={"default"}
              type="submit"
              size={"sm"}
              loading={loading}
            >
              Save Instruction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
