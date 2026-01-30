import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarUrlForAlumni, uiAvatarUrlFromName } from "@/lib/utils";

/** Avatar for alumni that falls back to UI Avatars when the primary image fails (e.g. 404). */
export function AlumniAvatar({
  alum,
  className,
  fallbackText,
}: {
  alum: { full_name?: string | null; avatar_url?: string | null };
  className?: string;
  fallbackText?: string;
}) {
  const primaryUrl = avatarUrlForAlumni(alum);
  const fallbackUrl = uiAvatarUrlFromName(alum.full_name);
  const [src, setSrc] = useState(primaryUrl);
  useEffect(() => {
    setSrc(primaryUrl);
  }, [primaryUrl]);
  const handleError = () => {
    if (fallbackUrl && src !== fallbackUrl) setSrc(fallbackUrl);
  };
  const initials =
    fallbackText ??
    (alum.full_name?.split(" ").map((n) => n[0]).join("") || "A");
  return (
    <Avatar className={className}>
      <AvatarImage src={src || undefined} onError={handleError} />
      <AvatarFallback className="bg-primary text-primary-foreground font-display">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
