"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import BlogEditorForm from "@/components/admin/BlogEditorForm";

export default function EditBlogPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.item) {
          setPost(data.item);
        }
      })
      .catch((err) => console.error("Error loading blog post:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={28} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-16 text-center text-muted font-mono text-xs">
        Article specimen not found.
      </div>
    );
  }

  return <BlogEditorForm initialData={post} isEditing={true} />;
}

