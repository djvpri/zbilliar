-- Samakan user demo dengan konvensi ekosistem Zomet: demo@zomet.my.id.
-- Guard NOT EXISTS supaya aman kalau demo@zomet.my.id sudah ada (hindari
-- pelanggaran unique username).
UPDATE "User" SET "username" = 'demo@zomet.my.id', "nama" = 'Akun Demo'
WHERE "username" = 'admin@billiardjaya.com'
  AND "tenantId" IN (SELECT "id" FROM "Tenant" WHERE "slug" = 'billiard-jaya')
  AND NOT EXISTS (SELECT 1 FROM "User" u2 WHERE u2."username" = 'demo@zomet.my.id');
