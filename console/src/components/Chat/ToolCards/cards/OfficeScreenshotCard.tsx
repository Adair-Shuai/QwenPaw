import React from "react";
import { useTranslation } from "react-i18next";
import { FileImage } from "lucide-react";
import type { ToolCallContent } from "../shared/types";
import { ToolCardShell, MediaPreview } from "../shared";
import { shortFileName, getMediaInfo } from "../shared/utils";

export interface OfficeScreenshotCardProps {
  content: ToolCallContent;
  isStreaming?: boolean;
}

/**
 * OfficeScreenshotCard — renders the PNG screenshot returned by
 * `office_view_screenshot`.
 *
 * The backend returns a DataBlock (image URL) + TextBlock (JSON
 * metadata).  GenericToolCard's stringifyResult only extracts
 * TextBlock content, so the image is lost.  This card uses
 * getMediaInfo() → extractUrlFromResultBlocks() to pull the image
 * URL from the DataBlock and render it via MediaPreview.
 */
const OfficeScreenshotCard: React.FC<OfficeScreenshotCardProps> = ({
  content,
  isStreaming,
}) => {
  const { t } = useTranslation();
  const params = content.params || {};
  const filePath = (params.file_path || "") as string;
  const page = (params.page as number) || 1;
  const file = shortFileName(filePath);

  const title = file
    ? t("tool.officeScreenshot", {
        file,
        page,
        defaultValue: `Screenshot · ${file} (page ${page})`,
      })
    : t("tool.officeScreenshotDefault", {
        page,
        defaultValue: `Office screenshot (page ${page})`,
      });

  const media = getMediaInfo(content);

  return (
    <ToolCardShell
      content={content}
      isStreaming={isStreaming}
      icon={<FileImage size={15} />}
      title={title}
      defaultExpanded={Boolean(media)}
    >
      {media && <MediaPreview media={media} />}
    </ToolCardShell>
  );
};

export default OfficeScreenshotCard;
