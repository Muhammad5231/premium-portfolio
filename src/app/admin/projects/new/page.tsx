import ProjectForm from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto">
      <ProjectForm isEdit={false} />
    </div>
  );
}

