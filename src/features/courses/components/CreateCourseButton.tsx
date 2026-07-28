"use client";

import { useState } from "react";
import CreateCourseModal from "./CreateCourseModal";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CreateCourseButton() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        variant="primary"
        leftIcon={<Plus className="w-4 h-4 text-slate-950" />}
        onClick={() => setVisible(true)}
      >
        Crear Curso
      </Button>

      <CreateCourseModal visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}
