"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { useExerciseStore } from "../hooks/useExerciseStore";
import { X, Plus, AlertCircle, Trash2 } from "lucide-react";

type Props = {
  id_class: string;
  type: "reading_quiz";
  order_index: number;
};

export default function ReadExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [] },
  };

  const rawItems = exercise.content?.items || [];
  
  // Enforce exactly one item structure
  const firstItem = rawItems[0] || {};
  const phrase = firstItem.phrase || "";
  
  // Migration of old format if present
  let questions = firstItem.questions || [];
  if (
    questions.length === 0 &&
    (firstItem.correct_answer || (firstItem.possible_answers && firstItem.possible_answers.length > 0))
  ) {
    questions = [
      {
        question: firstItem.question || "Pregunta 1",
        correct_answer: firstItem.correct_answer || "",
        possible_answers: firstItem.possible_answers || [],
      },
    ];
  }

  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  const updateField = (field: string, value: any) => {
    updateExercise(order_index, { ...exercise, [field]: value });
  };

  const updateContent = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      content: { ...exercise.content, [field]: value },
    });
  };

  const updatePhrase = (text: string) => {
    const updatedItem = {
      phrase: text,
      questions: questions,
    };
    updateContent("items", [updatedItem]);
  };

  const updateQuestionField = (qIndex: number, field: string, value: any) => {
    const updatedQuestions = questions.map((q: any, i: number) =>
      i === qIndex ? { ...q, [field]: value } : q
    );
    const updatedItem = {
      phrase: phrase,
      questions: updatedQuestions,
    };
    updateContent("items", [updatedItem]);
  };

  const updateCorrectAnswer = (qIndex: number, newCorrectVal: string) => {
    const q = questions[qIndex] || {};
    const oldCorrectVal = q.correct_answer || "";
    let newPossibles = [...(q.possible_answers || [])];

    const oldIdx = newPossibles.indexOf(oldCorrectVal);
    if (oldIdx !== -1) {
      if (newCorrectVal.trim() === "") {
        newPossibles.splice(oldIdx, 1);
      } else {
        newPossibles[oldIdx] = newCorrectVal;
      }
    } else if (newCorrectVal.trim() !== "") {
      if (!newPossibles.includes(newCorrectVal)) {
        newPossibles.push(newCorrectVal);
      }
    }

    newPossibles = Array.from(new Set(newPossibles)).filter((p) => p.trim() !== "");

    const updatedQuestions = questions.map((item: any, i: number) =>
      i === qIndex
        ? { ...item, correct_answer: newCorrectVal, possible_answers: newPossibles }
        : item
    );
    const updatedItem = {
      phrase: phrase,
      questions: updatedQuestions,
    };
    updateContent("items", [updatedItem]);
  };

  const addQuestion = () => {
    const updatedQuestions = [
      ...questions,
      { question: "", correct_answer: "", possible_answers: [] },
    ];
    const updatedItem = {
      phrase: phrase,
      questions: updatedQuestions,
    };
    updateContent("items", [updatedItem]);
  };

  const removeQuestion = (qIndex: number) => {
    const updatedQuestions = questions.filter((_: any, i: number) => i !== qIndex);
    const updatedItem = {
      phrase: phrase,
      questions: updatedQuestions,
    };
    updateContent("items", [updatedItem]);
  };

  const handleAddAnswer = (text: string, qIndex: number) => {
    const currentQuestion = questions[qIndex] || {};
    const currentPossibles = currentQuestion.possible_answers || [];

    if (text.includes(",")) {
      const parts = text.split(",");
      const lastPart = parts.pop() || "";
      const newAnswers = parts
        .map((p) => p.trim())
        .filter((p) => p !== "" && !currentPossibles.includes(p));

      if (newAnswers.length > 0) {
        updateQuestionField(qIndex, "possible_answers", [
          ...currentPossibles,
          ...newAnswers,
        ]);
      }
      setInputValues((prev) => ({ ...prev, [qIndex]: lastPart }));
    } else {
      setInputValues((prev) => ({ ...prev, [qIndex]: text }));
    }
  };

  const removeAnswer = (qIndex: number, answerIdx: number) => {
    const currentQuestion = questions[qIndex] || {};
    const currentPossibles = currentQuestion.possible_answers || [];
    updateQuestionField(
      qIndex,
      "possible_answers",
      currentPossibles.filter((_: any, i: number) => i !== answerIdx)
    );
  };

  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Lesson title"
        placeholder="e.g. Reading Comprehension"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.name)}
      />
      <FormInput
        label="Description"
        placeholder="e.g. Read the phrase and answer the questions"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.description)}
      />

      <div className="mt-4 p-5 bg-slate-50/70 rounded-xl border border-slate-200/80">
        <span className="font-semibold text-cyan-650 text-sm tracking-wide uppercase block mb-3">
          Lectura (Quiz de Lectura)
        </span>

        <FormInput
          label="Reading Phrase / Text"
          placeholder="e.g. Today is a sunny day. We went to the beach..."
          value={phrase}
          onChangeText={updatePhrase}
          multiline
        />

        <div className="mt-6 space-y-6">
          <div className="border-t border-slate-200/60 pt-4">
            <span className="font-bold text-slate-700 text-sm tracking-wide block mb-4">
              Preguntas Asociadas ({questions.length})
            </span>
          </div>

          {questions.map((q: any, qIndex: number) => {
            const isQInvalid =
              !q.question?.trim() ||
              !q.correct_answer?.trim() ||
              !q.possible_answers ||
              q.possible_answers.length === 0;

            return (
              <div
                key={qIndex}
                className={`p-4 bg-white rounded-xl border transition-colors ${
                  isQInvalid ? "border-amber-300 bg-amber-50/5" : "border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-650">
                    Pregunta {qIndex + 1}
                  </span>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-500/5"
                    onClick={() => removeQuestion(qIndex)}
                    title="Eliminar pregunta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <FormInput
                    label="Pregunta"
                    placeholder="e.g. Where did we go?"
                    value={q.question || ""}
                    onChangeText={(text) => updateQuestionField(qIndex, "question", text)}
                  />

                  <FormInput
                    label="Respuesta Correcta"
                    placeholder="e.g. to the beach"
                    value={q.correct_answer || ""}
                    onChangeText={(text) => updateCorrectAnswer(qIndex, text)}
                  />

                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 mb-1.5 block">
                      Posibles Respuestas (Opciones de Quiz)
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {q.possible_answers?.map((answer: string, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-slate-200 text-xs text-slate-700"
                        >
                          <span>{answer}</span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                            onClick={() => removeAnswer(qIndex, idx)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <FormInput
                      placeholder="Escribe las opciones y sepáralas con comas (,)"
                      value={inputValues[qIndex] || ""}
                      onChangeText={(text) => handleAddAnswer(text, qIndex)}
                    />
                  </div>

                  {isQInvalid && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50/50 p-2 rounded-lg border border-amber-100 mt-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Se requiere una pregunta, respuesta correcta y al menos una posible respuesta.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outlined"
            onClick={addQuestion}
            leftIcon={<Plus size={16} />}
            className="w-full border-dashed hover:border-cyan-500/30 text-cyan-650 hover:bg-cyan-500/5 py-2.5"
          >
            Agregar pregunta
          </Button>
        </div>
      </div>
    </div>
  );
}
