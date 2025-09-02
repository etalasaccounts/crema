"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getUserInitials } from "@/lib/user-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AccountPage() {
  const { user, isLoading } = useCurrentUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
     if (user) {
       setName(user.name || "");
       setEmail(user.email || "");
       setPhone(user.phone || "");
       setAvatarUrl(user.avatarUrl || "");
     }
   }, [user]);

  const handleSave = async () => {
     setIsSaving(true);
     try {
       const response = await fetch('/api/user/profile', {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           name,
           phone,
         }),
       });

       if (!response.ok) {
         throw new Error('Failed to update profile');
       }

       const data = await response.json();
       toast.success("Profile updated successfully!");
       
       // Update the user context with new data
       if (data.user) {
         setName(data.user.name);
         setPhone(data.user.phone || "");
       }
     } catch (error) {
       console.error('Profile update error:', error);
       toast.error("Failed to update profile. Please try again.");
     } finally {
       setIsSaving(false);
     }
   };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (file) {
       setIsUploadingAvatar(true);
       try {
         const formData = new FormData();
         formData.append('avatar', file);

         const response = await fetch('/api/user/avatar', {
           method: 'POST',
           body: formData,
         });

         if (!response.ok) {
           throw new Error('Failed to upload avatar');
         }

         const data = await response.json();
         if (data.avatarUrl) {
           setAvatarUrl(data.avatarUrl);
           toast.success("Avatar updated successfully!");
         }
       } catch (error) {
         console.error('Avatar upload error:', error);
         toast.error("Failed to upload avatar. Please try again.");
       } finally {
         setIsUploadingAvatar(false);
       }
     }
   };

  const handleCancel = () => {
     setName(user?.name || "");
     setEmail(user?.email || "");
     setPhone(user?.phone || "");
     setAvatarUrl(user?.avatarUrl || "");
   };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Please log in to view your account settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your account details and personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  placeholder="Enter your email address"
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}