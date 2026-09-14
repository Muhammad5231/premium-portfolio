import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";
import ProjectForm from "@/components/admin/ProjectForm";
import { IProject } from "@/types";

interface PageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: PageProps) {
  await connectToDatabase();

  const projectDoc = await Project.findById(params.id).lean();
  if (!projectDoc) {
    notFound();
  }

  const project: IProject = JSON.parse(JSON.stringify(projectDoc));

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto">
      <ProjectForm initialData={project} isEdit={true} />
    </div>
  );
}

