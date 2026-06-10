-- =============================================
-- CORRECCIÓN DEL FLUJO DE INVENTARIO
-- Ejecutar en Supabase → SQL Editor
-- =============================================

-- 1. Nueva función para CREAR el pedido y DESCONTAR el stock inmediatamente
CREATE OR REPLACE FUNCTION public.registrar_pedido(
  p_nombre text,
  p_telefono text,
  p_direccion text,
  p_detalle jsonb,
  p_total numeric
) RETURNS json AS $$
DECLARE
  v_pedido_id bigint;
  item jsonb;
  v_stock int;
BEGIN
  -- A. Validar que haya stock suficiente para todo lo que pidieron
  FOR item IN SELECT * FROM jsonb_array_elements(p_detalle)
  LOOP
    SELECT stock_actual INTO v_stock FROM inventario WHERE producto_id = (item->>'id')::bigint;
    IF v_stock < (item->>'qty')::int THEN
      RAISE EXCEPTION 'Stock insuficiente para el producto: %', item->>'name';
    END IF;
  END LOOP;

  -- B. Insertar el pedido en estado PENDIENTE
  INSERT INTO pedidos (nombre_cliente, telefono, direccion, detalle_carrito, total, estado)
  VALUES (p_nombre, p_telefono, p_direccion, p_detalle, p_total, 'PENDIENTE')
  RETURNING id INTO v_pedido_id;

  -- C. Descontar el stock inmediatamente
  FOR item IN SELECT * FROM jsonb_array_elements(p_detalle)
  LOOP
    UPDATE inventario
    SET stock_actual = stock_actual - (item->>'qty')::int
    WHERE producto_id = (item->>'id')::bigint;
  END LOOP;

  RETURN json_build_object('id', v_pedido_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Modificar completar_pedido para que YA NO descuente stock (porque ya se descontó arriba)
CREATE OR REPLACE FUNCTION public.completar_pedido(p_pedido_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE pedidos SET estado = 'COMPLETADO' WHERE id = p_pedido_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Nueva función para CANCELAR el pedido y DEVOLVER el stock al inventario
CREATE OR REPLACE FUNCTION public.cancelar_pedido_y_devolver_stock(p_pedido_id BIGINT)
RETURNS void AS $$
DECLARE
  cart_data JSONB;
  item JSONB;
BEGIN
  -- A. Obtener el detalle del carrito de ese pedido
  SELECT detalle_carrito INTO cart_data FROM pedidos WHERE id = p_pedido_id AND estado = 'PENDIENTE';
  
  IF cart_data IS NULL THEN
    RAISE EXCEPTION 'Pedido no encontrado o ya fue procesado.';
  END IF;

  -- B. Devolver las unidades al inventario
  FOR item IN SELECT * FROM jsonb_array_elements(cart_data)
  LOOP
    UPDATE inventario
    SET stock_actual = stock_actual + (item->>'qty')::INT
    WHERE producto_id = (item->>'id')::BIGINT;
  END LOOP;

  -- C. Marcar el pedido como CANCELADO
  UPDATE pedidos SET estado = 'CANCELADO' WHERE id = p_pedido_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
