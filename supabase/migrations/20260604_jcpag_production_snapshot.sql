-- JC Pagamentos — snapshot centralizado (Supabase produção)
-- Projeto: Jcsolucoes (wthdtoucdvlmsyvtbxul)

CREATE TABLE IF NOT EXISTS public.jcpag_snapshot (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{"v":2,"clientes":[],"contratos":[],"parcelas":[],"logs":[],"inicializado":false}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jcpag_snapshot ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jcpag_snapshot_anon_all ON public.jcpag_snapshot;
CREATE POLICY jcpag_snapshot_anon_all ON public.jcpag_snapshot
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.jcpag_snapshot TO anon, authenticated;
