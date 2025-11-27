-- CreateTable
CREATE TABLE "NoteRevision" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NoteRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NoteRevision_noteId_idx" ON "NoteRevision"("noteId");

-- AddForeignKey
ALTER TABLE "NoteRevision" ADD CONSTRAINT "NoteRevision_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteRevision" ADD CONSTRAINT "NoteRevision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

