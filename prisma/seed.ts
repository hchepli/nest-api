import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function main() {
  console.log('Iniciando seed...');

  // ------------------------------------------------------------
  // 1. ROLES (cargos base - RN005)
  // ------------------------------------------------------------
  const roleAdmin = await prisma.role.upsert({
    where: { name: 'Admin Geral' },
    update: {},
    create: {
      name: 'Admin Geral',
      description: 'Acesso total ao sistema',
      isBase: true,
    },
  });

  const roleSecretaria = await prisma.role.upsert({
    where: { name: 'Secretaria' },
    update: {},
    create: {
      name: 'Secretaria',
      description:
        'Gestão de comunicados, eventos, missas, calendário, sacramentos e galeria',
      isBase: true,
    },
  });

  const roleCoordenador = await prisma.role.upsert({
    where: { name: 'Coordenador de Pastoral' },
    update: {},
    create: {
      name: 'Coordenador de Pastoral',
      description: 'Gestão restrita ao conteúdo e às escalas da própria pastoral',
      isBase: true,
    },
  });

  console.log('Roles criados.');

  // ------------------------------------------------------------
  // 2. PASTORAL GROUPS (2, pra testar RN006/RN008 com escopo diferente)
  // ------------------------------------------------------------
  const pastoralCatequese = await prisma.pastoralGroup.create({
    data: {
      name: 'Catequese',
      description: 'Pastoral responsável pela catequese infantil e de adultos',
      contact: 'catequese@paroquia.org',
    },
  });

  const pastoralLiturgia = await prisma.pastoralGroup.create({
    data: {
      name: 'Liturgia',
      description: 'Pastoral responsável pela organização litúrgica das missas',
      contact: 'liturgia@paroquia.org',
    },
  });

  console.log('Grupos pastorais criados.');

  // ------------------------------------------------------------
  // 3. USERS (1 de cada cargo - senha hasheada de verdade)
  // ------------------------------------------------------------
  const passwordHash = await bcrypt.hash('senha12345', SALT_ROUNDS);

  const userAdmin = await prisma.user.create({
    data: {
      name: 'Admin Geral Teste',
      email: 'admin@paroquia.org',
      passwordHash,
      roleId: roleAdmin.id,
      status: 'ACTIVE',
    },
  });

  const userSecretaria = await prisma.user.create({
    data: {
      name: 'Secretaria Teste',
      email: 'secretaria@paroquia.org',
      passwordHash,
      roleId: roleSecretaria.id,
      status: 'ACTIVE',
    },
  });

  const userCoordenador = await prisma.user.create({
    data: {
      name: 'Coordenador Catequese Teste',
      email: 'coordenador.catequese@paroquia.org',
      passwordHash,
      roleId: roleCoordenador.id,
      pastoralGroupId: pastoralCatequese.id, // RN006
      status: 'ACTIVE',
    },
  });

  console.log('Usuários criados (senha para todos: senha12345).');

  // ------------------------------------------------------------
  // 4. VOLUNTEERS (2)
  // ------------------------------------------------------------
  const voluntario1 = await prisma.volunteer.create({
    data: { name: 'João da Silva', phone: '11999990001', email: 'joao@example.com', pastoralGroup: { connect: { id: 1 } }, },
  });

  const voluntario2 = await prisma.volunteer.create({
    data: { name: 'Maria Oliveira', phone: '11999990002', email: 'maria@example.com', pastoralGroup: { connect: { id: 2 } }, },
  });

  console.log('Voluntários criados.');

  // ------------------------------------------------------------
  // 5. CATEGORIES (1 EVENT, 1 ANNOUNCEMENT)
  // ------------------------------------------------------------
  const categoriaEvento = await prisma.category.create({
    data: { name: 'Festa Junina', type: 'EVENT' },
  });

  const categoriaComunicado = await prisma.category.create({
    data: { name: 'Aviso Geral', type: 'ANNOUNCEMENT' },
  });

  console.log('Categorias criadas.');

  // ------------------------------------------------------------
  // 6. MASSES (2)
  // ------------------------------------------------------------
  const missa1 = await prisma.mass.create({
    data: {
      title: 'Missa Dominical',
      dateTime: new Date('2026-09-06T10:00:00.000Z'),
      type: 'COMMON',
      location: 'Igreja Matriz',
    },
  });

  const missa2 = await prisma.mass.create({
    data: {
      title: 'Missa de Natal',
      dateTime: new Date('2026-12-24T22:00:00.000Z'),
      type: 'SPECIAL',
      location: 'Igreja Matriz',
      notes: 'Missa do Galo',
    },
  });

  console.log('Missas criadas.');

  // ------------------------------------------------------------
  // 7. EVENTS (2 - um vinculado a categoria, sem vínculo obrigatório com missa)
  // ------------------------------------------------------------
  const evento1 = await prisma.event.create({
    data: {
      name: 'Festa Junina 2026',
      slug: 'festa-junina-2026',
      description: 'Festa junina anual da paróquia',
      categoryId: categoriaEvento.id,
      startDate: new Date('2026-06-20T18:00:00.000Z'),
      endDate: new Date('2026-06-20T23:00:00.000Z'),
      location: 'Salão Paroquial',
      status: 'ACTIVE',
    },
  });

  const evento2 = await prisma.event.create({
    data: {
      name: 'Novena de Natal',
      slug: 'novena-de-natal-2026',
      description: 'Novena preparatória para o Natal',
      startDate: new Date('2026-12-15T19:00:00.000Z'),
      endDate: new Date('2026-12-23T21:00:00.000Z'),
      location: 'Igreja Matriz',
      status: 'ACTIVE',
      massId: missa2.id, // RN002 - correlação opcional
    },
  });

  console.log('Eventos criados.');

  // ------------------------------------------------------------
  // 8. SCHEDULES (1 por pastoral - RN007: vínculo exclusivo Mass XOR Event)
  // ------------------------------------------------------------
  const escalaCatequese = await prisma.schedule.create({
    data: {
      eventId: evento1.id,
      pastoralGroupId: pastoralCatequese.id,
    },
  });

  const escalaLiturgia = await prisma.schedule.create({
    data: {
      massId: missa1.id,
      pastoralGroupId: pastoralLiturgia.id,
    },
  });

  console.log('Escalas criadas.');

  // ------------------------------------------------------------
  // 9. SCHEDULE ASSIGNMENTS (atribuições dos voluntários nas escalas)
  // ------------------------------------------------------------
  await prisma.scheduleAssignment.create({
    data: {
      scheduleId: escalaCatequese.id,
      volunteerId: voluntario1.id,
      role: 'apoio_organizacao',
    },
  });

  await prisma.scheduleAssignment.create({
    data: {
      scheduleId: escalaLiturgia.id,
      volunteerId: voluntario2.id,
      role: 'leitor',
    },
  });

  console.log('Atribuições de escala criadas.');

  // ------------------------------------------------------------
  // 10. ANNOUNCEMENTS (1 DRAFT, 1 PUBLISHED - autor = Admin Geral)
  // ------------------------------------------------------------
  await prisma.announcement.create({
    data: {
      title: 'Comunicado de teste (rascunho)',
      slug: 'comunicado-de-teste-rascunho',
      content: 'Este é um comunicado ainda não publicado.',
      categoryId: categoriaComunicado.id,
      status: 'DRAFT',
      authorId: userAdmin.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Comunicado de teste (publicado)',
      slug: 'comunicado-de-teste-publicado',
      content: 'Este comunicado já está visível no site institucional.',
      categoryId: categoriaComunicado.id,
      status: 'PUBLISHED',
      authorId: userSecretaria.id,
    },
  });

  console.log('Comunicados criados.');

  // ------------------------------------------------------------
  // 11. SACRAMENT (1)
  // ------------------------------------------------------------
  await prisma.sacrament.create({
    data: {
      name: 'Batismo',
      slug: 'batismo',
      description: 'Sacramento de iniciação cristã.',
      requiredDocuments: 'Certidão de nascimento da criança, documento dos pais.',
      faq: [
        { pergunta: 'Qual a idade mínima?', resposta: 'Não há idade mínima definida.' },
      ],
      displayOrder: 1,
    },
  });

  console.log('Sacramento criado.');

  // ------------------------------------------------------------
  // 12. ALBUMS (1 avulso, 1 vinculado a evento - RN003)
  // ------------------------------------------------------------
  const albumAvulso = await prisma.album.create({
    data: {
      title: 'Álbum Avulso de Teste',
      slug: 'album-avulso-de-teste',
      description: 'Álbum sem vínculo com nenhum evento.',
    },
  });

  const albumEvento = await prisma.album.create({
    data: {
      title: 'Fotos da Festa Junina 2026',
      slug: 'fotos-da-festa-junina-2026',
      description: 'Registro fotográfico da Festa Junina.',
      eventId: evento1.id,
    },
  });

  console.log('Álbuns criados.');

  // ------------------------------------------------------------
  // 13. PHOTOS (2 no álbum vinculado ao evento - RN010)
  // ------------------------------------------------------------
  await prisma.photo.create({
    data: {
      albumId: albumEvento.id,
      url: 'https://placeholder.local/fotos/festa-junina-1.jpg',
      isCover: true,
    },
  });

  await prisma.photo.create({
    data: {
      albumId: albumEvento.id,
      url: 'https://placeholder.local/fotos/festa-junina-2.jpg',
      isCover: false,
    },
  });

  console.log('Fotos criadas.');

  // ------------------------------------------------------------
  // 14. ATTENDANCE CONFIRMATION (RF012 - sem login, 1 de teste)
  // ------------------------------------------------------------
  await prisma.attendanceConfirmation.create({
    data: {
      eventId: evento1.id,
      name: 'Visitante de Teste',
      contact: '11988887777',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('Confirmação de presença criada.');

  // ------------------------------------------------------------
  // 15. PERMISSIONS (básico - Admin Geral com acesso total a "usuarios")
  // (AuditLog NÃO é semeado: é gerado pelo próprio sistema, não faz
  // sentido popular manualmente - RNF011)
  // ------------------------------------------------------------
  await prisma.permission.create({
    data: {
      roleId: roleAdmin.id,
      resource: 'usuarios',
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canView: true,
    },
  });

  await prisma.permission.create({
    data: {
      roleId: roleSecretaria.id,
      resource: 'eventos',
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canView: true,
    },
  });

  console.log('Permissões criadas.');

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });