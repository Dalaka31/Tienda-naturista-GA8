-- =============================================
-- ACTUALIZACIÓN DE INVENTARIO - El Jardín de Morgana
-- Ejecutar en Supabase → SQL Editor
-- =============================================

-- 1. Crear filas de inventario para todos los productos que YA existen
-- y que no tienen una fila de inventario asignada.
INSERT INTO inventario (producto_id, stock_actual)
SELECT id, 0 FROM products
WHERE id NOT IN (SELECT producto_id FROM inventario);

-- 2. Crear una función que se ejecute automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.inventario (producto_id, stock_actual)
  VALUES (new.id, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el Trigger para que cuando agregues un Producto nuevo desde el panel,
-- la base de datos automáticamente le cree su registro de inventario en 0.
DROP TRIGGER IF EXISTS on_product_created ON products;
CREATE TRIGGER on_product_created
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_product();
