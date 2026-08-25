-- Ejecuta este script en Supabase: Panel de tu proyecto > SQL Editor > New query > Run

create extension if not exists "pgcrypto";

-- Tabla de gastos
create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  concepto text not null,
  categoria text,
  proveedor text,
  monto numeric(12,2) not null check (monto > 0),
  metodo_pago text,
  notas text,
  created_at timestamptz not null default now()
);

-- Tabla de reposiciones
create table if not exists reposiciones (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  concepto text,
  monto numeric(12,2) not null check (monto > 0),
  notas text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table gastos enable row level security;
alter table reposiciones enable row level security;

-- Como la app no tiene login (usa la clave "anon" de Supabase), estas políticas
-- permiten leer y escribir a cualquiera que tenga esa clave. Es aceptable para
-- un uso interno/privado, pero ten en cuenta que la anon key queda visible en
-- el navegador. Si en el futuro agregas login, cambia estas políticas para
-- exigir auth.uid().

create policy "Acceso público a gastos" on gastos
  for all using (true) with check (true);

create policy "Acceso público a reposiciones" on reposiciones
  for all using (true) with check (true);

-- Índices útiles para ordenar por fecha
create index if not exists gastos_fecha_idx on gastos (fecha desc);
create index if not exists reposiciones_fecha_idx on reposiciones (fecha desc);
