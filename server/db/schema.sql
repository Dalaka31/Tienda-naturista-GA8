-- =============================================
-- SCHEMA SQL - El Jardín de Morgana OMS
-- Ejecutar en Supabase → SQL Editor
-- =============================================

-- 1. Tabla de Pedidos
CREATE TABLE pedidos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_cliente VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  direccion TEXT NOT NULL,
  detalle_carrito JSONB NOT NULL,
  total NUMERIC(12, 2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'COMPLETADO', 'CANCELADO')),
  fecha TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Inventario
CREATE TABLE inventario (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  producto_id BIGINT REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  stock_actual INT DEFAULT 0
);

-- 3. Políticas RLS (acceso abierto para prototipo académico)
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso total pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso total inventario" ON inventario FOR ALL USING (true) WITH CHECK (true);

-- 4. Función RPC para completar pedido (TRANSACCIÓN ATÓMICA)
-- Esto es el equivalente de START TRANSACTION / COMMIT / ROLLBACK
-- Las funciones PL/pgSQL son transaccionales por defecto en PostgreSQL
CREATE OR REPLACE FUNCTION completar_pedido(p_pedido_id BIGINT)
RETURNS VOID AS $$
DECLARE
  item RECORD;
  cart_data JSONB;
  pedido_estado VARCHAR;
BEGIN
  -- Verificar que el pedido existe y está PENDIENTE
  SELECT estado, detalle_carrito INTO pedido_estado, cart_data
  FROM pedidos WHERE id = p_pedido_id;

  IF pedido_estado IS NULL THEN
    RAISE EXCEPTION 'Pedido no encontrado';
  END IF;

  IF pedido_estado != 'PENDIENTE' THEN
    RAISE EXCEPTION 'El pedido ya fue procesado (estado: %)', pedido_estado;
  END IF;

  -- PASO 1: Cambiar estado a COMPLETADO
  UPDATE pedidos SET estado = 'COMPLETADO' WHERE id = p_pedido_id;

  -- PASO 2: Bucle para actualizar inventario por cada producto del carrito
  FOR item IN SELECT * FROM jsonb_array_elements(cart_data)
  LOOP
    UPDATE inventario
    SET stock_actual = stock_actual - (item.value->>'qty')::INT
    WHERE producto_id = (item.value->>'id')::BIGINT;
  END LOOP;

  -- Si todo sale bien, PostgreSQL hace COMMIT automático
  -- Si ocurre cualquier error, PostgreSQL hace ROLLBACK automático
END;
$$ LANGUAGE plpgsql;
