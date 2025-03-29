"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAssistantSchema,
  CreateAssistantInput,
  FILE_CONFIG,
  AVAILABLE_MODELS,
} from "@/lib/validations/assistant-old";

interface AssistantFormProps {
  onSubmit: (data: CreateAssistantInput) => Promise<void>;
}

export default function AssistantForm({ onSubmit }: AssistantFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm<CreateAssistantInput>({
    resolver: zodResolver(createAssistantSchema),
    defaultValues: {
      name: "",
      model: "gpt-4-turbo-preview",
      instructions: "",
      temperature: 0.7,
      files: [],
    },
  });

  const files = watch("files") || [];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => file);

      setValue("files", [...(files || []), ...newFiles]);
    },
    [setValue, files]
  );

  const removeFile = (index: number) => {
    const currentFiles = getValues("files") || [];
    setValue(
      "files",
      currentFiles.filter((_, i) => i !== index)
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: FILE_CONFIG.accept,
    maxSize: FILE_CONFIG.maxSize,
  });

  const handleCreateAssistant = async (formData: CreateAssistantInput) => {
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error creating assistant:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilePreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(handleCreateAssistant)}
        className="flex flex-col gap-8 h-full"
      >
        <div className="flex justify-between items-center h-fit border-b border-border py-3 px-5">
          <p className="text-xl font-semibold">Create Assistant</p>
          {/* Buttons */}
          <div className="flex gap-2 justify-end w-fit">
            <Button type="button" variant="ghost" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving Assistant.." : "Save Assistant"}
            </Button>
          </div>
        </div>
        <div className="flex h-full px-8">
          <div className="flex w-full gap-8">
            {" "}
            {/* Instructions */}
            <div className="flex flex-col w-full h-full gap-1.5 pb-6">
              {errors.instructions && (
                <p className="text-red-500">{errors.instructions.message}</p>
              )}
              <Controller
                name="instructions"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Provide clear instructions about how the assistant should behave
                and respond."
                    className="h-full"
                  />
                )}
              />
            </div>
            <div className="flex flex-col min-w-80 gap-4">
              {" "}
              {/* Assistant Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Assistant Name</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter a name for your assistant"
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-red-500">{errors.name.message}</p>
                )}
              </div>
              {/* Model */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Model</label>
                <Controller
                  name="model"
                  control={control}
                  rules={{ required: "Please select a model" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model, index) => (
                          <SelectItem key={index} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.model && (
                  <p className="text-red-500">{errors.model.message}</p>
                )}
              </div>
              {/* Temperature */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium mb-2">
                  Temperature: {getValues("temperature")}
                </label>
                <Controller
                  name="temperature"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  )}
                />
                {errors.temperature && (
                  <p className="text-red-500">{errors.temperature.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  0 = more focused, 1 = more creative
                </p>
              </div>
              {/* File Uploader */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium">Upload Files</label>
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 cursor-pointer",
                    "hover:border-primary/50 transition-colors",
                    isDragActive && "border-primary bg-primary/5"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-1.5 text-center text-muted-foreground">
                    <p className="text-xs">
                      <span className="font-medium">Drop</span> or{" "}
                      <span className="font-medium">Click</span> to select files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      pdf, txt, md, json (max 20mb)
                    </p>
                  </div>
                </div>

                {errors.files && (
                  <p className="text-red-500">{errors.files.message}</p>
                )}

                {files.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {files.map((fileObj, index) => (
                      <div
                        key={fileObj.name}
                        className="flex items-center justify-between px-3 py-1.5 bg-muted rounded-md"
                      >
                        <a
                          href={getFilePreviewUrl(fileObj)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono truncate text-primary hover:underline"
                        >
                          {fileObj.name}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X height={16} width={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
