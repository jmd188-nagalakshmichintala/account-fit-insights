import { useEffect } from "react";

import { DataTable } from "@/components/ui/dataTable/DataTable";
import { Spinner } from "@/components/ui/Spinner";
import {
  useQueryResult,
  useVisualizationImage,
} from "../hooks/useGenieConversation";
import { MarkdownContent } from "./MarkdownContent";

function AttachmentVisualization({ conversationId, messageId, attachmentId }) {
  const { data: imageUrl } = useVisualizationImage(
    conversationId,
    messageId,
    attachmentId,
  );

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt="Query visualization"
      className="mt-2 max-w-full rounded-md border border-slate-200"
    />
  );
}

function AttachmentQueryResult({
  conversationId,
  messageId,
  attachmentId,
  vizAttachmentId,
}) {
  const { data, isLoading } = useQueryResult(
    conversationId,
    messageId,
    attachmentId,
  );

  if (isLoading) return <Spinner className="py-3" />;

  const statementResponse = data?.statement_response ?? data;
  const rawColumns = statementResponse?.manifest?.schema?.columns ?? [];
  const rows = statementResponse?.result?.data_array ?? [];

  if (!rawColumns.length) return null;

  const columns = rawColumns.map((column, index) => ({
    id: column.name ?? `col-${index}`,
    header: column.name ?? `Column ${index + 1}`,
    enableSorting: false,
    accessorFn: (row) => row[index],
    cell: (info) => String(info.getValue() ?? ""),
  }));

  return (
    <div className="mt-2">
      {vizAttachmentId && (
        <AttachmentVisualization
          conversationId={conversationId}
          messageId={messageId}
          attachmentId={vizAttachmentId}
        />
      )}
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(_row, index) => String(index)}
        manualSorting={false}
        scrollHeight={220}
        emptyMessage="Query returned no rows."
        className="mt-2 text-xs"
      />
    </div>
  );
}

function Attachment({
  attachment,
  conversationId,
  messageId,
  vizAttachmentId,
}) {
  return (
    <>
      {attachment.text?.content && (
        <MarkdownContent className="text-xs">
          {attachment.text.content}
        </MarkdownContent>
      )}
      {attachment.query && (
        <AttachmentQueryResult
          conversationId={conversationId}
          messageId={messageId}
          attachmentId={attachment.attachment_id}
          vizAttachmentId={vizAttachmentId}
        />
      )}
    </>
  );
}

function buildVizAttachmentMap(attachments) {
  const map = {};
  for (const attachment of attachments) {
    if (attachment.viz?.query_attachment_id) {
      map[attachment.viz.query_attachment_id] = attachment.attachment_id;
    }
  }
  return map;
}

export function AttachmentList({ attachments, conversationId, messageId }) {
  const vizAttachmentMap = buildVizAttachmentMap(attachments);

  return (
    <>
      {attachments.map((attachment) => (
        <Attachment
          key={attachment.attachment_id}
          attachment={attachment}
          conversationId={conversationId}
          messageId={messageId}
          vizAttachmentId={vizAttachmentMap[attachment.attachment_id]}
        />
      ))}
    </>
  );
}
