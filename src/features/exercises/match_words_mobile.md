# Especificación de Implementación Móvil: Ejercicio Match Words

Este documento detalla la arquitectura, el diseño de interacción (UX/UI) y la lógica de negocio recomendada para consumir el tipo de ejercicio `match_words` en la aplicación móvil de aprendizaje de inglés.

---

## 1. Estructura de Datos (API Payload)

El backend de Supabase entregará el ejercicio con el siguiente formato JSON para el campo `content`. La estructura consta de un array `items` que contiene un objeto con una propiedad `pairs` (el array de las parejas inglés-español):

```json
{
  "items": [
    {
      "pairs": [
        { "english": "Apple", "spanish": "Manzana" },
        { "english": "Dog", "spanish": "Perro" },
        { "english": "House", "spanish": "Casa" },
        { "english": "Blue", "spanish": "Azul" },
        { "english": "Run", "spanish": "Correr" },
        { "english": "Happy", "spanish": "Feliz" }
      ]
    }
  ]
}
```

> [!IMPORTANT]
> El API devuelve las parejas ordenadas y emparejadas en el array `pairs`. **Nunca** deben renderizarse en el mismo orden físico en el dispositivo móvil, ya que el usuario simplemente emparejaría filas adyacentes horizontalmente.

---

## 2. Flujo de Experiencia del Usuario (UX/UI) en Móvil

1. **Presentación**: Se muestran dos columnas independientes. La columna de la izquierda muestra los términos en inglés; la de la derecha muestra las traducciones en español.
2. **Barajado Independiente (Shuffle)**: Al cargar el ejercicio, el cliente móvil extrae las palabras en inglés y las traduce en español de forma independiente a partir de `items[0].pairs`, y las desordena de forma aleatoria.
3. **Interacción Táctil**:
   - El usuario pulsa una palabra de cualquier columna. Esta entra en estado **Seleccionado** (cambio de color de fondo, elevación y borde activo).
   - El usuario pulsa una palabra de la otra columna.
4. **Validación de la Pareja**:
   - **Coincidencia (Match)**: Si el par seleccionado es correcto, ambos botones cambian al estado **Correcto** (verde con una pequeña animación de pulso/escala o desvanecimiento gradual), se reproduce un sonido corto de acierto y se deshabilitan para interacciones futuras.
   - **Error**: Si no coinciden, cambian al estado **Incorrecto** (rojo, sacudida lateral mediante haptic feedback y animación de vibración), se reproduce un sonido de error, y tras 800ms se limpia la selección para que el usuario intente de nuevo.
5. **Finalización del Ejercicio**: Una vez que todas las parejas han sido vinculadas correctamente, el ejercicio se marca como completado y se habilita el botón "Continuar".

---

## 3. Estados Locales de la Interfaz

Para mantener la UI limpia y reaccionar de forma óptima a las interacciones, se sugieren los siguientes estados en el componente móvil:

| Nombre del Estado | Tipo | Descripción |
| :--- | :--- | :--- |
| `englishOptions` | `Array<{ id: string, word: string }>` | Lista aleatoria de palabras en inglés. |
| `spanishOptions` | `Array<{ id: string, word: string }>` | Lista aleatoria de significados en español. |
| `selectedEnglish` | `string \| null` | ID de la palabra en inglés actualmente seleccionada. |
| `selectedSpanish` | `string \| null` | ID de la palabra en español actualmente seleccionada. |
| `matchedPairs` | `Set<string>` | Conjunto de IDs de palabras que ya han sido emparejadas exitosamente. |
| `failedPairs` | `Array<string>` | IDs de los elementos en proceso de animación de error (rojo/sacudida). |

---

## 4. Ejemplo de Implementación en React Native (TypeScript)

El siguiente ejemplo de código ilustra cómo implementar este comportamiento utilizando React Native, hooks de estado y lógica de validación adaptada al payload real.

```tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Vibration
} from 'react-native';

interface WordPair {
  english: string;
  spanish: string;
}

interface MatchWordsItem {
  pairs: WordPair[];
}

interface MatchWordsProps {
  items: MatchWordsItem[];
  onComplete: () => void;
}

interface RenderItem {
  id: string; // Para mantener la relación, usamos la palabra en inglés como ID único
  word: string;
}

export default function MatchWordsExercise({ items, onComplete }: MatchWordsProps) {
  const [englishOptions, setEnglishOptions] = useState<RenderItem[]>([]);
  const [spanishOptions, setSpanishOptions] = useState<RenderItem[]>([]);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedSpanish, setSelectedSpanish] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [failedPairs, setFailedPairs] = useState<string[]>([]);

  const firstItem = items[0] || { pairs: [] };
  const pairsList = firstItem.pairs || [];

  // Inicializar y barajar opciones al montar el componente
  useEffect(() => {
    const shuffleArray = <T,>(array: T[]): T[] => {
      return [...array].sort(() => Math.random() - 0.5);
    };

    const enList = pairsList.map(item => ({ id: item.english, word: item.english }));
    const esList = pairsList.map(item => ({ id: item.english, word: item.spanish })); // La llave de relación es el inglés

    setEnglishOptions(shuffleArray(enList));
    setSpanishOptions(shuffleArray(esList));
  }, [items]);

  // Verificar la combinación cuando se seleccionan ambas
  useEffect(() => {
    if (selectedEnglish && selectedSpanish) {
      if (selectedEnglish === selectedSpanish) {
        // MATCH CORRECTO
        const newMatched = new Set(matchedPairs);
        newMatched.add(selectedEnglish);
        setMatchedPairs(newMatched);
        
        // Limpiar selección
        setSelectedEnglish(null);
        setSelectedSpanish(null);

        // Validar si el juego terminó
        if (newMatched.size === pairsList.length) {
          onComplete();
        }
      } else {
        // MATCH INCORRECTO
        const pairToFail = [selectedEnglish, selectedSpanish];
        setFailedPairs(pairToFail);
        
        // Haptic feedback (Vibración corta)
        Vibration.vibrate(100);

        // Bloquear temporalmente e inducir retroalimentación visual de error
        setTimeout(() => {
          setFailedPairs([]);
          setSelectedEnglish(null);
          setSelectedSpanish(null);
        }, 800);
      }
    }
  }, [selectedEnglish, selectedSpanish]);

  const handlePressEnglish = (id: string) => {
    if (matchedPairs.has(id) || failedPairs.includes(id)) return;
    setSelectedEnglish(id === selectedEnglish ? null : id);
  };

  const handlePressSpanish = (id: string) => {
    if (matchedPairs.has(id) || failedPairs.includes(id)) return;
    setSelectedSpanish(id === selectedSpanish ? null : id);
  };

  const getItemStyle = (id: string, isEnglish: boolean) => {
    const isSelected = isEnglish ? selectedEnglish === id : selectedSpanish === id;
    const isMatched = matchedPairs.has(id);
    const isFailed = failedPairs.includes(id);

    if (isMatched) return styles.itemMatched;
    if (isFailed) return styles.itemFailed;
    if (isSelected) return styles.itemSelected;
    return styles.itemDefault;
  };

  const getTextStyle = (id: string) => {
    const isMatched = matchedPairs.has(id);
    if (isMatched) return styles.textMatched;
    return styles.textDefault;
  };

  return (
    <View className="flex-1 bg-cream-50 px-4 py-6" style={styles.container}>
      <Text className="text-xl font-bold text-center text-slate-800 mb-6">
        Relaciona las Palabras
      </Text>

      <View className="flex-row justify-between w-full" style={styles.columnsContainer}>
        {/* Columna Inglés */}
        <View className="w-[47%]" style={styles.column}>
          {englishOptions.map((item) => (
            <TouchableOpacity
              key={`en-${item.id}`}
              onPress={() => handlePressEnglish(item.id)}
              disabled={matchedPairs.has(item.id) || failedPairs.length > 0}
              style={[styles.itemCard, getItemStyle(item.id, true)]}
              activeOpacity={0.7}
            >
              <Text style={[styles.wordText, getTextStyle(item.id)]}>{item.word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Columna Español */}
        <View className="w-[47%]" style={styles.column}>
          {spanishOptions.map((item) => (
            <TouchableOpacity
              key={`es-${item.id}`}
              onPress={() => handlePressSpanish(item.id)}
              disabled={matchedPairs.has(item.id) || failedPairs.length > 0}
              style={[styles.itemCard, getItemStyle(item.id, false)]}
              activeOpacity={0.7}
            >
              <Text style={[styles.wordText, getTextStyle(item.id)]}>{item.word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFCF2', // Fondo crema premium
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    gap: 12,
  },
  itemCard: {
    minHeight: 56, // Cumple accesibilidad táctil min 48-56dp
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  itemSelected: {
    backgroundColor: '#ECFEFF',
    borderColor: '#06B6D4', // Borde cian
  },
  itemMatched: {
    backgroundColor: '#DCFCE7', // Verde translúcido
    borderColor: '#22C55E',
    shadowOpacity: 0,
    elevation: 0,
  },
  itemFailed: {
    backgroundColor: '#FEE2E2', // Rojo translúcido
    borderColor: '#EF4444',
  },
  wordText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  textDefault: {
    color: '#1E293B',
  },
  textMatched: {
    color: '#16A34A',
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
});
```

---

## 5. Accesibilidad e Inclusión (A11y)

- **Lectores de pantalla (VoiceOver / TalkBack)**:
  - Cada elemento interactivo debe tener un `accessibilityLabel` apropiado. Por ejemplo: `"Palabra en inglés: Apple. Estado: Seleccionado"` o `"Traducción en español: Manzana. Estado: Emparejado"`.
  - Cuando se completa con éxito una pareja, anunciar el éxito mediante accesibilidad: `AccessibilityInfo.announceForAccessibility('Pareja correcta: Apple y Manzana emparejados')`.
- **Contraste de color**: Los fondos translúcidos (`#DCFCE7` verde suave, `#FEE2E2` rojo suave) deben mantener colores de texto con suficiente contraste (relación mínima 4.5:1).
- **Vibraciones adaptadas**: Permitir en la configuración de la app desactivar el haptic feedback para usuarios con sensibilidades a estímulos sensoriales.
