-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatMessages" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChatMessages_AB_unique" ON "_ChatMessages"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatMessages_B_index" ON "_ChatMessages"("B");

-- AddForeignKey
ALTER TABLE "_ChatMessages" ADD CONSTRAINT "_ChatMessages_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatMessages" ADD CONSTRAINT "_ChatMessages_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
