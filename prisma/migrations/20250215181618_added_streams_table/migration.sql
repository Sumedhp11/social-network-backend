-- CreateTable
CREATE TABLE "LiveStreams" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "streamId" TEXT NOT NULL,

    CONSTRAINT "LiveStreams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveStreams_streamId_key" ON "LiveStreams"("streamId");

-- AddForeignKey
ALTER TABLE "LiveStreams" ADD CONSTRAINT "LiveStreams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
