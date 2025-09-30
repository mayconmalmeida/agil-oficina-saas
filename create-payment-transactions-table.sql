-- Create payment_transactions table for webhook audit trail
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL UNIQUE,
    amount DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trialing', 'pending')),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('essencial_mensal', 'essencial_anual', 'premium_mensal', 'premium_anual')),
    payment_method TEXT DEFAULT 'cakto',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON public.payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment transactions" ON public.payment_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON public.payment_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payment_transactions TO service_role;