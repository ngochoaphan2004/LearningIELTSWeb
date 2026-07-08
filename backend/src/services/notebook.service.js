const prisma = require('../config/prisma');

const getVocabularyNotebook = async (userId, page = 1, limit = 50, search, startDate, endDate, sortBy = 'newest') => {
  const skip = (page - 1) * limit;
  
  const whereClause = { userId };
  
  if (search) {
    whereClause.OR = [
      { phrase: { contains: search, mode: 'insensitive' } },
      { meaning: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (startDate || endDate) {
    whereClause.created_at = {};
    if (startDate) whereClause.created_at.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.created_at.lte = end;
    }
  }

  let orderBy = { created_at: 'desc' };
  if (sortBy === 'oldest') orderBy = { created_at: 'asc' };
  else if (sortBy === 'alphabet') orderBy = { phrase: 'asc' };

  const notes = await prisma.vocabularyNote.findMany({
    where: whereClause,
    include: { session: true },
    orderBy,
    skip,
    take: Number(limit)
  });
  
  const total = await prisma.vocabularyNote.count({ where: whereClause });
  
  return {
    data: notes,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getErrorLogNotebook = async (userId, page = 1, limit = 20, search, startDate, endDate, sortBy = 'newest') => {
  const skip = (page - 1) * limit;

  const whereClause = { userId };
  if (search) {
    whereClause.OR = [
      { content_submitted: { contains: search, mode: 'insensitive' } },
      { errors_found: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (startDate || endDate) {
    whereClause.created_at = {};
    if (startDate) whereClause.created_at.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.created_at.lte = end;
    }
  }

  let orderBy = { created_at: 'desc' };
  if (sortBy === 'oldest') orderBy = { created_at: 'asc' };

  const logs = await prisma.errorLog.findMany({
    where: whereClause,
    include: { session: true },
    orderBy,
    skip,
    take: Number(limit)
  });
  
  const total = await prisma.errorLog.count({ where: whereClause });
  
  return {
    data: logs,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getDictationNotebook = async (userId, page = 1, limit = 20, search, startDate, endDate, sortBy = 'newest') => {
  const skip = (page - 1) * limit;

  const whereClause = { userId };
  if (search) {
    whereClause.dictation_text = { contains: search, mode: 'insensitive' };
  }
  if (startDate || endDate) {
    whereClause.created_at = {};
    if (startDate) whereClause.created_at.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.created_at.lte = end;
    }
  }

  let orderBy = { created_at: 'desc' };
  if (sortBy === 'oldest') orderBy = { created_at: 'asc' };

  const dictations = await prisma.dictationNote.findMany({
    where: whereClause,
    include: { session: true },
    orderBy,
    skip,
    take: Number(limit)
  });
  
  const total = await prisma.dictationNote.count({ where: whereClause });
  
  return {
    data: dictations,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getVocabularyNotebook,
  getErrorLogNotebook,
  getDictationNotebook
};
