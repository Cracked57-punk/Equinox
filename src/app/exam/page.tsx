import { requireTeam } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getExamSession } from '@/actions/exam';
import { ExamClient } from '../../components/team/ExamClient';
import { ClientStartExam } from '../../components/team/ClientStartExam';
import { WaitingRoom } from '../../components/team/WaitingRoom';

export const metadata = {
  title: 'Exam | Equinox Portal',
};

export default async function ExamPage() {
  const team = await requireTeam();

  const settings = await prisma.roundSettings.findUnique({
    where: { id: 'singleton' },
  });

  const roundStatus = settings?.roundStatus || 'not_started';

  if (roundStatus === 'not_started') {
    return <WaitingRoom teamName={team.name} />;
  }

  if (roundStatus === 'ended') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">Round Ended</h1>
        <p className="text-gray-400">The exam is now over. Thank you for participating!</p>
      </div>
    );
  }

  // Round is in_progress
  const session = await getExamSession();

  if (!session) {
    // Round started but team doesn't have a session yet
    return <ClientStartExam />;
  }

  if (session.submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">Exam Submitted</h1>
        <p className="text-gray-400">
          Your responses have been recorded. Thank you!
        </p>
      </div>
    );
  }

  // Active exam!
  return <ExamClient initialSession={session} teamName={team.name} />;
}
