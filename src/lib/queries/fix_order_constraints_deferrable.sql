-- SQL para corregir la violación de la restricción de unicidad unique_order_per_unit y unique_order_per_course
-- al reordenar elementos tras la eliminación de clases o unidades.
-- Hace que las restricciones de unicidad sean deferibles (DEFERRABLE INITIALLY DEFERRED),
-- evitando colisiones temporales de índices de orden durante la ejecución de sentencias UPDATE.

-- 1. Modificar restricción única de order_index por unidad en la tabla class
ALTER TABLE public.class 
DROP CONSTRAINT IF EXISTS unique_order_per_unit;

ALTER TABLE public.class 
ADD CONSTRAINT unique_order_per_unit UNIQUE (id_unit, order_index) 
DEFERRABLE INITIALLY DEFERRED;

-- 2. Modificar restricción única de order_index por curso en la tabla unit
ALTER TABLE public.unit 
DROP CONSTRAINT IF EXISTS unique_order_per_course;

ALTER TABLE public.unit 
ADD CONSTRAINT unique_order_per_course UNIQUE (id_course, order_index) 
DEFERRABLE INITIALLY DEFERRED;
