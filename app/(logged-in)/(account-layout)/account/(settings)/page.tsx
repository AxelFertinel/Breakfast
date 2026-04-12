import { getRequiredUser } from "@/lib/auth/auth-user";
import { combineWithParentMetadata } from "@/lib/metadata";
import { Suspense } from "react";
import { EditProfileCardForm } from "./edit-profile-form";

export const generateMetadata = combineWithParentMetadata({
  title: "Settings",
  description: "Update your profile.",
});

export default function Page() {
  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <Suspense fallback={null}>
        <EditProfilePage />
      </Suspense>
    </div>
  );
}

async function EditProfilePage() {
  const user = await getRequiredUser();

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <EditProfileCardForm defaultValues={user} />
    </div>
  );
}
