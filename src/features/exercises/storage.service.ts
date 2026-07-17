import { supabase } from "@/lib/supabase";

/**
 * Sube un archivo (imagen, audio o video) a Supabase Storage y retorna la URL pública.
 * Si se le pasa un string (ya es una URL existente), lo retorna tal cual.
 */
export async function uploadFile(
  fileOrUrl: File | string,
  bucket: string = "exercise-assets",
): Promise<string> {
  if (typeof fileOrUrl === "string") {
    return fileOrUrl;
  }

  const file = fileOrUrl;

  try {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    throw error;
  }
}

export async function deleteExercises(ids: string[]): Promise<void> {
  const { deleteExercises: deleteEx } = await import("./exercise.service");
  await deleteEx(ids);
}

/**
 * Procesa el ejercicio según su tipo para subir contenido local (Files) antes de guardar.
 */
export async function processExerciseFiles<T extends { type: string; content: any }>(
  exercise: T,
): Promise<T> {
  const { type, content } = exercise;
  const newContent = { ...content };

  try {
    switch (type) {
      case "image_gallery":
      case "match_names":
        if (Array.isArray(newContent.items)) {
          newContent.items = await Promise.all(
            newContent.items.map(async (item: any) => ({
              ...item,
              images: item.images
                ? await Promise.all(
                    item.images.map(async (img: any) => ({
                      ...img,
                      url: await uploadFile(img.url),
                    })),
                  )
                : item.images,
            })),
          );
        }
        break;

      case "say_word":
      case "write_word":
        if (Array.isArray(newContent.items)) {
          newContent.items = await Promise.all(
            newContent.items.map(async (item: any) => ({
              ...item,
              image_url: item.image_url
                ? await uploadFile(item.image_url)
                : item.image_url,
            })),
          );
        }
        break;

      case "audio_session":
        if (Array.isArray(newContent.items)) {
          newContent.items = await Promise.all(
            newContent.items.map(async (item: any) => ({
              ...item,
              cover_image: item.cover_image
                ? await uploadFile(item.cover_image, "exercise-assets")
                : item.cover_image,
              audio_url: item.audio_url
                ? await uploadFile(item.audio_url, "exercise-audios")
                : item.audio_url,
            })),
          );
        }
        break;

      default:
        break;
    }

    return { ...exercise, content: newContent };
  } catch (error) {
    console.error(`Error procesando archivos para ejercicio tipo ${type}:`, error);
    throw error;
  }
}
