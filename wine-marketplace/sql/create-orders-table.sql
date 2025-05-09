-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  items JSONB NOT NULL,
  shipping_address JSONB,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON orders(order_number);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);
