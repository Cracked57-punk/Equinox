-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "magicToken" TEXT,
    "magicTokenExpiresAt" TIMESTAMP(3),
    "backupCode" TEXT,
    "loggedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "magicToken" TEXT,
    "magicTokenExpiresAt" TIMESTAMP(3),
    "loggedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "imageLinks" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSession" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "autoSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamQuestionAnswer" (
    "id" TEXT NOT NULL,
    "examSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "selected" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_visited',
    "isCorrect" BOOLEAN,

    CONSTRAINT "TeamQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "questionsPerTeam" INTEGER NOT NULL DEFAULT 10,
    "timePerQuestionSec" INTEGER NOT NULL DEFAULT 90,
    "startGate" TEXT NOT NULL DEFAULT 'manual',
    "roundStatus" TEXT NOT NULL DEFAULT 'not_started',
    "roundStartedAt" TIMESTAMP(3),
    "roundEndsAt" TIMESTAMP(3),

    CONSTRAINT "RoundSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_magicToken_key" ON "Team"("magicToken");

-- CreateIndex
CREATE UNIQUE INDEX "Team_backupCode_key" ON "Team"("backupCode");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_magicToken_key" ON "AdminUser"("magicToken");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSession_teamId_key" ON "ExamSession"("teamId");

-- CreateIndex
CREATE INDEX "TeamQuestionAnswer_examSessionId_idx" ON "TeamQuestionAnswer"("examSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamQuestionAnswer_examSessionId_questionId_key" ON "TeamQuestionAnswer"("examSessionId", "questionId");

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamQuestionAnswer" ADD CONSTRAINT "TeamQuestionAnswer_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "ExamSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamQuestionAnswer" ADD CONSTRAINT "TeamQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
