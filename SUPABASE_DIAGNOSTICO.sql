-- SCRIPT DE DIAGNÓSTICO - Ejecuta esto en Supabase SQL Editor
-- Indica qué está faltando

-- 1. Verificar si existen las tablas
SELECT 
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ EXISTE' ELSE '❌ FALTA' END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subjects', 'notebooks', 'notebook_entries', 'notebook_media')
ORDER BY table_name;

-- 2. Verificar RLS habilitado
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('subjects', 'notebooks', 'notebook_entries', 'notebook_media')
ORDER BY tablename;

-- 3. Contar políticas de seguridad
SELECT 
  schemaname,
  tablename,
  COUNT(*) as num_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('subjects', 'notebooks', 'notebook_entries', 'notebook_media')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 4. Ver todas las políticas
SELECT policyname, tablename, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('subjects', 'notebooks', 'notebook_entries', 'notebook_media')
ORDER BY tablename, policyname;
