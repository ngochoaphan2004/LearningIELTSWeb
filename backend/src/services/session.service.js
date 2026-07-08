const prisma = require('../config/prisma');

const completeSession = async (userId, sessionId, notebookData) => {
  const progress = await prisma.userSessionProgress.findFirst({
    where: { userId, sessionId },
    include: { session: true }
  });

  if (!progress || !progress.started_at) {
    throw new Error("Bạn chưa bắt đầu tính giờ cho phiên học này.");
  }

  const elapsedSeconds = (Date.now() - new Date(progress.started_at).getTime()) / 1000;
  const requiredSeconds = (progress.session.duration_minutes * 60) / 2;

  if (elapsedSeconds < requiredSeconds) {
    throw new Error("Bạn cần học tối thiểu 50% thời lượng của bài học để hoàn thành.");
  }

  // Update session status to COMPLETED
  await prisma.userSessionProgress.update({
    where: { id: progress.id },
    data: { status: 'COMPLETED', completed_at: new Date() }
  });

  // Calculate Streak based on Vietnam Time (UTC+7)
  const getVietnamDateString = (date) => {
    const d = new Date(date);
    d.setUTCHours(d.getUTCHours() + 7);
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const completedAtDateStr = getVietnamDateString(Date.now());
  const completedAtLocal = new Date(completedAtDateStr); // Midnight UTC of the local date

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  let newStreak = user.current_streak || 0;
  let newMaxStreak = user.max_streak || 0;
  let newLastStudyDate = user.last_study_date;

  if (!user.last_study_date) {
    newStreak = 1;
    newMaxStreak = 1;
    newLastStudyDate = completedAtLocal;
  } else {
    // Both last_study_date and completedAtLocal are normalized to UTC midnight, 
    // but we run getVietnamDateString again on last_study_date just in case
    const lastDateStr = getVietnamDateString(user.last_study_date);
    const lastDateLocal = new Date(lastDateStr);

    const diffTime = completedAtLocal.getTime() - lastDateLocal.getTime();
    const MathRoundDiffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (MathRoundDiffDays === 1) {
      // Studied on consecutive day
      newStreak += 1;
      newMaxStreak = Math.max(newMaxStreak, newStreak);
      newLastStudyDate = completedAtLocal;
    } else if (MathRoundDiffDays > 1) {
      // Streak broken
      newStreak = 1;
      newLastStudyDate = completedAtLocal;
    }
  }

  // Update user if streak changed
  if (newStreak !== user.current_streak || newLastStudyDate !== user.last_study_date) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        current_streak: newStreak,
        max_streak: newMaxStreak,
        last_study_date: newLastStudyDate
      }
    });
  }

  const session = await prisma.studySession.findUnique({ where: { id: sessionId } });

  // Save Notebook Data if provided
  if (notebookData && session) {
    const skill = session.focus_skill || '';
    if (skill.includes('Từ vựng') || skill.includes('Reading')) {
      if (Array.isArray(notebookData.items)) {
        const vocabNotes = notebookData.items.map(item => ({
          userId,
          sessionId,
          phrase: item.phrase || '',
          meaning: item.meaning || '',
          example_sentence: item.example_sentence || '',
          errors_in_sentence: item.errors_in_sentence || ''
        }));
        if (vocabNotes.length > 0) {
          await prisma.vocabularyNote.createMany({ data: vocabNotes });
        }
      }
    } else if (skill.includes('Writing')) {
      await prisma.errorLog.create({
        data: {
          userId,
          sessionId,
          content_submitted: notebookData.content_submitted || '',
          errors_found: notebookData.errors_found || ''
        }
      });
    } else if (skill.includes('Listening')) {
      await prisma.dictationNote.create({
        data: {
          userId,
          sessionId,
          audio_link: notebookData.audio_link || '',
          dictation_text: notebookData.dictation_text || ''
        }
      });
    }
  }

  // Create a notification to push to the Community Feed
  if (session) {
    await prisma.feedActivity.create({
      data: {
        userId,
        action_type: 'COMPLETED_SESSION',
        content: `vừa xuất sắc hoàn thành: ${session.title}`
      }
    });
  }

  return progress;
};

module.exports = { completeSession };
