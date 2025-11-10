"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { genMediaUrl } from "@/global/utils/url.utils";
import { AlertCircle, Clock, RefreshCw, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import UpdateUserPopup from "../user-management/_components/mangeuser/UpdateUserPopup";
import { useCurrentUserProfileHook } from "./hooks/useCurrentUserProfileHook";
import { useProfileActions } from "./hooks/useProfileActions";

// Full component — drop directly into a shadcn + Tailwind React app
// Exports a responsive admin profile card for the supplied user object.

function formatDateISO(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto p-4 max-w-4xl">
      <Card className="rounded-2xl overflow-hidden">
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="space-y-2">
                <Skeleton className="w-48 h-6" />
                <Skeleton className="w-64 h-4" />
                <div className="flex gap-2">
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-1">
            <CardHeader>
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-48 h-3" />
              <Skeleton className="w-24 h-8" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </div>
        <CardFooter className="border-t">
          <Skeleton className="mx-auto w-48 h-3" />
        </CardFooter>
      </Card>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="mx-auto p-4 max-w-4xl">
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Failed to load profile</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || "An error occurred while fetching your profile."}
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-1 w-4 h-4" />
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default function AdminProfileCard() {
  const [update, setUpdate] = useState(false);
  const { userProfile, isLoading, error, refetch, refreshProfile, isEnabled } =
    useCurrentUserProfileHook();
  const { refreshProfileData } = useProfileActions();

  const handleEditProfile = () => {
    setUpdate(true);
  };

  const handleRetry = () => {
    refetch();
  };

  const handleRefresh = () => {
    refreshProfile();
  };

  const handleUserUpdate = (isOpen: boolean) => {
    setUpdate(isOpen);
    if (!isOpen) {
      refreshProfileData();
    }
  };

  // Show loading state
  if (isLoading || !isEnabled) {
    return <LoadingSkeleton />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error as Error} onRetry={handleRetry} />;
  }

  // Show message if no user profile data
  if (!userProfile) {
    return (
      <div className="mx-auto p-4 max-w-4xl">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>No Profile Data</AlertTitle>
          <AlertDescription>
            Your profile information is not available at the moment.
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="mr-1 w-4 h-4" />
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 max-w-4xl">
      <Card className="rounded-2xl overflow-hidden">
        <div className="gap-6 grid grid-cols-1">
          {/* Avatar + basic info */}
          <div className="md:col-span-2 p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={genMediaUrl(userProfile.avatar)}
                  alt={userProfile.name}
                />
                <AvatarFallback className="font-semibold text-lg">
                  {userProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-xl leading-none">
                  {userProfile.name}
                </h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  {userProfile.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="uppercase">
                    {userProfile.role}
                  </Badge>
                  <Badge
                    className={
                      userProfile.accountStatus === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }
                  >
                    {userProfile.accountStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Stats / contact */}
          <div className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Contact & Activity</CardTitle>
              <CardDescription className="text-xs">
                Recent login and contact details
              </CardDescription>
              <CardAction>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-medium"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <div className="text-sm">Phone</div>
                  </div>
                  <div className="font-medium text-sm">
                    {userProfile.phoneNo || "Not provided"}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <div className="text-sm">Last login</div>
                  </div>
                  <div className="font-medium text-sm">
                    {userProfile.lastLogin
                      ? formatDateISO(userProfile.lastLogin)
                      : "Never"}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <div className="text-sm">Created</div>
                  </div>
                  <div className="font-medium text-sm">
                    {formatDateISO(userProfile.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
        <CardFooter className="border-t">
          <p className="w-full text-xs text-center">
            Last updated: {formatDateISO(userProfile.updatedAt)}
          </p>
        </CardFooter>
      </Card>
      {userProfile && (
        <UpdateUserPopup
          user={userProfile}
          showPopup={update}
          onPopupClose={handleUserUpdate}
        />
      )}
    </div>
  );
}
