import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { storage } from "@/app/lib/storage";
import { createReadStream } from "fs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const assignment = await prisma.assignment.findUnique({
    where: {
      userId_fileId: {
        userId: session.user.id,
        fileId: params.id
      }
    },
    include: { file: true }
  });

  if (!assignment) {
    return new Response("Not found", { status: 404 });
  }

  if (assignment.status !== "UNLOCKED") {
    return new Response("Locked", { status: 403 });
  }

  const filePath = storage.getFilePath(assignment.file.storedName);
  const stream = createReadStream(filePath);

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": assignment.file.mimeType,
      "Content-Disposition": `attachment; filename=\"${assignment.file.originalName}\"`
    }
  });
}
