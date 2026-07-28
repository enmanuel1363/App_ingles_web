"use client";

import { useState } from "react";
import CreateUnitModal from './CreateUnitModal';
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";

type Props = {
  courseId: string;
};

export default function CreateUnitButton({ courseId }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        variant="primary"
        leftIcon={<Plus className="w-4 h-4 text-slate-950" />}
        onClick={() => setVisible(true)}
      >
        Crear unidad
      </Button>

      <CreateUnitModal
        visible={visible}
        onClose={() => setVisible(false)}
        courseId={courseId}
      />
    </>
  );
}
