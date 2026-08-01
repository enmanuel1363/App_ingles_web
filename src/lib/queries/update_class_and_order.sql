-- RPC para actualizar el nombre, tipo y orden (order_index) de una lección (class)
-- Desplaza las posiciones de las lecciones intermedias de manera atómica.
-- Se apoya en que la restricción 'unique_order_per_unit' es DEFERRABLE.

CREATE OR REPLACE FUNCTION update_class_and_order(
  p_class_id uuid,
  p_name text,
  p_type text,
  p_new_order_index integer
)
RETURNS void AS $$
DECLARE
  v_unit_id uuid;
  v_old_order_index integer;
BEGIN
  -- Obtener unidad y orden actual
  SELECT id_unit, order_index INTO v_unit_id, v_old_order_index
  FROM public.class
  WHERE id = p_class_id;

  IF v_unit_id IS NULL THEN
    RAISE EXCEPTION 'Class with ID % not found', p_class_id;
  END IF;

  -- Si el orden cambió, realizamos el reordenamiento
  IF v_old_order_index <> p_new_order_index THEN
    IF v_old_order_index < p_new_order_index THEN
      -- Mover hacia abajo: restar 1 a las clases intermedias
      UPDATE public.class
      SET order_index = order_index - 1
      WHERE id_unit = v_unit_id
        AND order_index > v_old_order_index
        AND order_index <= p_new_order_index;
    ELSE
      -- Mover hacia arriba: sumar 1 a las clases intermedias
      UPDATE public.class
      SET order_index = order_index + 1
      WHERE id_unit = v_unit_id
        AND order_index >= p_new_order_index
        AND order_index < v_old_order_index;
    END IF;
  END IF;

  -- Actualizar la lección seleccionada
  UPDATE public.class
  SET name = p_name,
      type = p_type::class_type,
      order_index = p_new_order_index,
      updated_at = now()
  WHERE id = p_class_id;
END;
$$ LANGUAGE plpgsql;
