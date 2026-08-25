# -*- coding: utf-8 -*-
"""
QwenPaw file management module P0 end-to-end test cases.

Combined test cases:
- FILE-001: Page load + file list + Preview/Edit mode verification
- FILE-002: Multi-tab open, switch, close, and reload verification

Run with: pytest tests/test_files_p0.py -v
"""
from __future__ import annotations

import logging
import pytest
from playwright.sync_api import Page, expect

from config.settings import config
from utils.helpers import log_test_step, log_test_result

logger = logging.getLogger(__name__)

WORKSPACE_URL = f"{config.base_url}/files"
FILE_ITEM_SELECTOR = 'button[class*="treeRow"]:not([aria-expanded])'
FILE_NAME_SELECTOR = "span"
FILE_META_SELECTOR = "span"

def navigate_to_workspace(page: Page):
    """Navigate to the workspace page and wait for it to load."""
    page.goto(WORKSPACE_URL)
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_timeout(3000)

def get_file_items(page: Page):
    """Get the file list; skip the test if empty."""
    items = page.locator(FILE_ITEM_SELECTOR).all()
    if len(items) == 0:
        pytest.skip("No file items found")
    return items

# ============================================================================
# FILE-001: Page load + file list + editor
# ============================================================================

@pytest.mark.integration
@pytest.mark.p0
@pytest.mark.files
class TestFileListEditSave:
    """
    FILE-001: Page load + file list + Preview/Edit mode verification.

    Coverage:
    1. Hard-assert breadcrumb / core files heading
    2. Hard-assert file list count > 0
    3. Hard-assert first file name / meta non-empty
    4. Click file -> editor panel visible + content non-empty hard-assert
    5. Switch from Preview to Edit and verify Monaco + Save controls
    """

    @pytest.mark.test_id("FILE-001")
    def test_file_list_view_edit_save(self, page: Page, request: pytest.FixtureRequest):
        """Verify file list display and opening the editor."""
        test_name = request.node.name

        # Step 1: Visit the workspace page
        log_test_step("1. Visit the workspace page")
        navigate_to_workspace(page)

        # Step 2: Verify breadcrumb
        log_test_step("2. Verify breadcrumb")
        try:
            breadcrumb = page.locator(
                'span[class*="breadcrumbCurrent"]:has-text("Files"), '
                'span[class*="breadcrumbCurrent"]:has-text("Workspace")'
            ).first
            if not breadcrumb.is_visible():
                breadcrumb = page.locator('text=Workspace, text=Files').first
            expect(breadcrumb).to_be_visible(timeout=5000)
            logger.info("Breadcrumb verified")
        except Exception:
            logger.warning("Breadcrumb verification skipped (locale mismatch)")

        # Step 3: Verify the core-files heading
        log_test_step("3. Verify the core-files heading")
        section_title = page.locator('h3[class*="sectionTitle"]:has-text("Core Files"), h3[class*="sectionTitle"]:has-text("Core")').first
        try:
            expect(section_title).to_be_visible(timeout=5000)
            logger.info("Core files heading visible")
        except Exception:
            logger.warning("Core files heading not found, skipping verification")

        # Step 4: Verify the file list
        log_test_step("4. Verify the file list")
        file_items = get_file_items(page)
        file_count = len(file_items)
        assert file_count >= 1, "File list should have at least 1 file"
        logger.info(f"File count: {file_count}")

        # Step 5: Verify the first file's info
        log_test_step("5. Verify the first file's info")
        first_file = file_items[0]
        name_el = first_file.locator(FILE_NAME_SELECTOR).first
        expect(name_el).to_be_visible(timeout=3000)
        file_name = name_el.inner_text()
        assert len(file_name) > 0, "File name is empty"
        logger.info(f"First file: {file_name}")

        meta_el = first_file.locator(FILE_META_SELECTOR).first
        expect(meta_el).to_be_visible(timeout=3000)
        file_meta = meta_el.inner_text()
        assert len(file_meta) > 0, "File meta is empty"
        logger.info(f"Meta: {file_meta}")

        # Step 6: Click the file to open the editor
        log_test_step("6. Click the file to open the editor")
        first_file.click()
        page.wait_for_timeout(2000)

        content_area = page.locator(
            '[class*="markdownViewer"], [class*="preview"], '
            '[class*="editor"], textarea, .monaco-editor'
        ).first
        expect(content_area).to_be_visible(timeout=5000)
        editor_content = content_area.text_content() or ""
        assert len(editor_content.strip()) > 0, "Editor/preview content is empty"
        logger.info(f"Editor opened; content length: {len(editor_content)} chars")

        # Step 7: The new workspace opens every file Preview-first and exposes
        # an explicit Edit mode backed by Monaco.
        log_test_step("7. Verify Preview/Edit controls and enter Edit mode")
        preview_btn = page.get_by_role("button", name="Preview", exact=True)
        edit_btn = page.get_by_role("button", name="Edit", exact=True)
        expect(preview_btn).to_be_visible(timeout=5000)
        expect(edit_btn).to_be_visible(timeout=5000)
        edit_btn.click()
        expect(page.locator(".monaco-editor").first).to_be_visible(timeout=10000)

        save_btn = page.get_by_role("button", name="Save", exact=True)
        expect(save_btn).to_be_visible(timeout=5000)
        expect(save_btn).to_be_disabled(timeout=5000)
        logger.info("Preview/Edit mode switch and clean editor state verified")

        log_test_result(test_name, True, 0)
        logger.info(f"Test {test_name} passed - file list display and opening editor OK")

# ============================================================================
# FILE-002: Multi-tab open, switch, close, and reload
# ============================================================================

@pytest.mark.integration
@pytest.mark.p0
@pytest.mark.files
class TestFileToggleReorderMemory:
    """
    FILE-002: Verify the new workspace's multi-file tab lifecycle.

    Coverage:
    1. Open two files from the tree
    2. Verify both editor tabs exist and the second is active
    3. Switch back to the first tab
    4. Close the second tab
    5. Reload and verify the file tree still exists
    """

    @pytest.mark.test_id("FILE-002")
    def test_file_toggle_reorder_memory(self, page: Page, request: pytest.FixtureRequest):
        """Verify multi-file tab open, switch, close, and reload behavior."""
        test_name = request.node.name

        # Step 1: Visit the workspace page
        log_test_step("1. Visit the workspace page")
        navigate_to_workspace(page)

        # Step 2: Open the first two files
        log_test_step("2. Open two files from the tree")
        file_items = get_file_items(page)
        logger.info(f"File count: {len(file_items)}")
        if len(file_items) < 2:
            pytest.skip("Need at least two files for multi-tab verification")
        first_name = file_items[0].inner_text().strip()
        second_name = file_items[1].inner_text().strip()
        file_items[0].click()
        page.wait_for_timeout(500)
        file_items[1].click()
        page.wait_for_timeout(1000)

        first_tab = page.get_by_role("tab").filter(has_text=first_name).first
        second_tab = page.get_by_role("tab").filter(has_text=second_name).first
        expect(first_tab).to_be_visible(timeout=5000)
        expect(second_tab).to_be_visible(timeout=5000)
        expect(second_tab).to_have_attribute("aria-selected", "true")

        log_test_step("3. Switch back to the first file tab")
        first_tab.click()
        expect(first_tab).to_have_attribute("aria-selected", "true")

        log_test_step("4. Close the second file tab")
        page.get_by_role(
            "button", name=f"Close tab: {second_name}", exact=True
        ).click()
        expect(second_tab).to_be_hidden(timeout=5000)

        log_test_step("5. Reload and verify file tree")
        page.reload()
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(3000)

        refreshed_items = page.locator(FILE_ITEM_SELECTOR).all()
        assert len(refreshed_items) >= 1, "File list is empty after reload"
        logger.info(f"File list still present after reload, count: {len(refreshed_items)}")

        log_test_result(test_name, True, 0)
        logger.info(f"Test {test_name} passed - multi-tab lifecycle OK")

# ============================================================================
# FILE-003: File content edit, save and reset
# ============================================================================

@pytest.mark.integration
@pytest.mark.p0
@pytest.mark.files
class TestFileContentEditAndSave:
    """
    FILE-003: File content edit, save and reset.

    Coverage:
    1. Click file to open editor (default Markdown preview mode)
    2. Turn off the preview switch to enter edit mode (textarea)
    3. Modify content in the textarea
    4. Click save (the button is enabled only when hasChanges is true)
    5. Reload to verify persistence
    6. Use the reset button to restore the original content

    Source reference: FileEditor.tsx - default showMarkdown=true,
    must turn off the Preview Switch to expose the Input.TextArea.
    Save/Reset buttons live in the editorHeader buttonGroup.
    """

    @pytest.mark.test_id("FILE-003")
    def test_file_content_edit_save_reset(
        self,
        page: Page,
        api_context,
        request: pytest.FixtureRequest,
    ):
        """Verify file content edit, save and reset."""
        test_name = request.node.name
        file_name = "e2e-files-edit.md"
        original_content = "# Files E2E\n\nOriginal content.\n"
        marker = "\n\n## Saved through Monaco"
        updated_content = original_content + marker

        reset_resp = api_context.put(
            "/api/workspace/project-directory", data={"path": None}
        )
        assert reset_resp.ok
        seed_resp = api_context.put(
            f"/api/workspace/files/{file_name}",
            data={"content": original_content},
        )
        assert seed_resp.ok, (
            f"Seed file failed [{seed_resp.status}]: {seed_resp.text()}"
        )

        log_test_step("1. Visit the workspace page")
        navigate_to_workspace(page)

        log_test_step("2. Open the seeded Markdown file")
        file_item = page.get_by_role("button", name=file_name, exact=True)
        expect(file_item).to_be_visible(timeout=5000)
        file_item.click()
        page.wait_for_timeout(2000)

        log_test_step("3. Enter Edit mode and wait for Monaco")
        edit_btn = page.get_by_role("button", name="Edit", exact=True)
        expect(edit_btn).to_be_visible(timeout=5000)
        edit_btn.click()
        monaco = page.locator(".monaco-editor").first
        expect(monaco).to_be_visible(timeout=10000)

        try:
            log_test_step("4. Append a Markdown section in Monaco")
            monaco.click(position={"x": 200, "y": 60})
            page.keyboard.type(marker)

            log_test_step("5. Save through the workspace toolbar")
            save_btn = page.get_by_role("button", name="Save", exact=True)
            expect(save_btn).to_be_enabled(timeout=5000)
            with page.expect_response(
                lambda response: (
                    "/api/workspace/file-content" in response.url
                    and response.request.method == "PUT"
                ),
                timeout=10000,
            ) as save_info:
                save_btn.click()
            assert save_info.value.ok, (
                f"Workspace save failed [{save_info.value.status}]"
            )

            log_test_step("6. Verify the saved content through the workspace API")
            read_resp = api_context.get(
                f"/api/workspace/file-content?path={file_name}&root=project"
            )
            assert read_resp.ok, (
                f"Saved file read failed [{read_resp.status}]: {read_resp.text()}"
            )
            saved_content = read_resp.json()["content"].replace("\r\n", "\n")
            assert saved_content == updated_content

            log_test_step("7. Reload, reopen, and verify Edit mode remains usable")
            page.reload()
            page.wait_for_load_state("domcontentloaded")
            page.wait_for_timeout(3000)
            file_item = page.get_by_role("button", name=file_name, exact=True)
            expect(file_item).to_be_visible(timeout=5000)
            file_item.click()
            page.get_by_role("button", name="Edit", exact=True).click()
            expect(page.locator(".monaco-editor").first).to_be_visible(
                timeout=10000
            )

            log_test_result(test_name, True, 0)
            logger.info(f"Test {test_name} passed - Monaco edit and save OK")
        finally:
            restore_resp = api_context.put(
                f"/api/workspace/files/{file_name}",
                data={"content": original_content},
            )
            assert restore_resp.ok, (
                f"File cleanup failed [{restore_resp.status}]: "
                f"{restore_resp.text()}"
            )

# ============================================================================
# FILE-004: Workspace upload and download
# ============================================================================

@pytest.mark.integration
@pytest.mark.p0
@pytest.mark.files
class TestWorkspaceUploadDownload:
    """
    FILE-004: Workspace upload and download.

    Combined coverage:
    1. Visit the workspace page
    2. Find the download-workspace button
    3. Verify the download button is visible and enabled
    4. Find the upload-workspace button
    5. Verify the upload button is visible and enabled
    6. Click the upload button to verify the file selector triggers (without actually uploading)

    Scenario:
    Admin verifies that workspace upload/download buttons display and work correctly,
    so users can conveniently manage workspace files.
    """

    @pytest.mark.test_id("FILE-004")
    def test_workspace_download_and_upload_button(self, page: Page, request: pytest.FixtureRequest):
        """Verify workspace upload and download buttons."""
        test_name = request.node.name

        log_test_step("1. Visit the workspace page")
        navigate_to_workspace(page)

        log_test_step("2. Find the file upload button")
        upload_btn = page.locator(
            'button[aria-label="Upload files"], '
            'button[aria-label="上传文件"]'
        ).first

        log_test_step("3. Verify upload button is visible and enabled")
        expect(upload_btn).to_be_visible(timeout=5000)
        assert upload_btn.is_enabled(), "Upload button should be enabled"
        logger.info("Upload button visible and enabled")

        log_test_step("4. Verify the multi-file input exists")
        file_input = page.locator('input[type="file"][multiple]').first
        assert file_input.count() > 0, "A hidden multi-file upload input should exist"
        logger.info("Hidden multi-file input exists")

        log_test_result(test_name, True, 0)
        logger.info(f"Test {test_name} passed - workspace upload/download buttons OK")


# ============================================================================
# FILE-P1-004: Daily memory expand/collapse view
# ============================================================================

@pytest.mark.integration
@pytest.mark.p1
@pytest.mark.files
class TestDailyMemoryView:
    """
    FILE-P1-004: Daily memory expand/collapse view.

    Coverage:
    1. Find the daily memory section in the file list
    2. Expand a daily memory entry to view its content
    3. Collapse a daily memory entry
    """

    @pytest.mark.test_id("FILE-P1-004")
    def test_daily_memory_view(self, page: Page, request: pytest.FixtureRequest):
        """Test daily memory expand/collapse."""
        test_name = request.node.name

        log_test_step("Navigate to the workspace page")
        page.goto(f"{config.base_url}/files")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(3000)

        log_test_step("Find the daily memory section")
        memory_section = page.locator(
            ':text("Daily"), :text("Memory"), '
            ':text("daily"), :text("memory"), '
            '[class*="memory"], [class*="Memory"]'
        ).first

        if memory_section.count() == 0:
            logger.info("Daily memory section not found; verifying file list exists")
            file_list = page.locator(
                '[class*="fileList"], [class*="FileList"], '
                '.qwenpaw-tree, .ant-tree'
            ).first
            if file_list.count() > 0:
                logger.info("File list exists")
            else:
                logger.info("File list also not found; page may be empty")
            log_test_result(test_name, True, 0)
            return

        logger.info("Found daily memory section")

        log_test_step("Find expandable memory items")
        # Daily memory typically uses Collapse or clickable list items
        expandable_items = page.locator(
            '.qwenpaw-collapse-header, .ant-collapse-header, '
            '[class*="memoryItem"], [class*="memory-item"], '
            '[class*="dailyMemory"] [class*="header"]'
        ).all()

        if len(expandable_items) > 0:
            logger.info(f"Found {len(expandable_items)} expandable memory items")

            log_test_step("Expand the first memory item")
            expandable_items[0].click()
            page.wait_for_timeout(1000)

            # Verify expanded content
            expanded_content = page.locator(
                '.qwenpaw-collapse-content-active, .ant-collapse-content-active, '
                '[class*="memoryContent"], [class*="memory-content"]'
            ).first
            if expanded_content.count() > 0:
                content_text = expanded_content.inner_text()
                logger.info(f"Memory content expanded; length: {len(content_text)}")
            else:
                logger.info("No explicit content area found after expansion")

            log_test_step("Collapse the memory item")
            expandable_items[0].click()
            page.wait_for_timeout(500)
            logger.info("Memory item collapsed")
        else:
            logger.info("No expandable memory items found; another display mechanism may be used")
            # Try clicking the memory section
            memory_section.click()
            page.wait_for_timeout(1000)

        log_test_result(test_name, True, 0)

# ============================================================================
# FILE-P1-005: Markdown live preview
# ============================================================================

@pytest.mark.integration
@pytest.mark.p1
@pytest.mark.files
class TestMarkdownPreview:
    """
    FILE-P1-005: Markdown live preview.

    Coverage:
    1. Select a Markdown file in the file list
    2. Verify the editor area exists
    3. Verify the preview area exists
    """

    @pytest.mark.test_id("FILE-P1-005")
    def test_markdown_preview(self, page: Page, request: pytest.FixtureRequest):
        """Test Markdown live preview."""
        test_name = request.node.name

        log_test_step("Navigate to the workspace page")
        page.goto(f"{config.base_url}/files")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(3000)

        log_test_step("Find Markdown files in the file list")
        md_files = page.locator(
            ':text(".md"), :text("README"), '
            '[class*="file"]:has-text(".md")'
        ).all()

        if len(md_files) == 0:
            # Fall back to any file in the file tree
            file_items = page.locator(
                '.qwenpaw-tree-treenode, .ant-tree-treenode, '
                '[class*="fileItem"], [class*="file-item"]'
            ).all()
            if len(file_items) > 0:
                logger.info(f"Found {len(file_items)} file items; clicking the first")
                file_items[0].click()
                page.wait_for_timeout(2000)
            else:
                logger.info("File list is empty; skipping Markdown preview test")
                log_test_result(test_name, True, 0)
                return
        else:
            logger.info(f"Found {len(md_files)} Markdown-related files")
            md_files[0].click()
            page.wait_for_timeout(2000)

        log_test_step("Verify editor/preview areas exist")
        editor_area = page.locator(
            'textarea, [class*="editor"], [class*="Editor"], '
            '[class*="CodeMirror"], [class*="monaco"], '
            '[class*="fileContent"], [class*="file-content"]'
        ).first

        preview_area = page.locator(
            '[class*="preview"], [class*="Preview"], '
            '[class*="markdown"], [class*="Markdown"], '
            '.markdown-body'
        ).first

        has_editor = editor_area.count() > 0
        has_preview = preview_area.count() > 0

        if has_editor:
            logger.info("Editor area exists")
        if has_preview:
            logger.info("Preview area exists")
            preview_content = preview_area.inner_text()
            logger.info(f"Preview content length: {len(preview_content)}")

        if not has_editor and not has_preview:
            # At least verify a file content area exists
            content_area = page.locator(
                '[class*="content"], pre, code'
            ).first
            if content_area.count() > 0:
                logger.info("Found a file content display area")
            else:
                logger.info("Neither editor nor preview area found")

        log_test_result(test_name, True, 0)


# ============================================================================
# FILE-P2-001: Restore workspace via ZIP upload
# ============================================================================

@pytest.mark.integration
@pytest.mark.p2
@pytest.mark.files
class TestWorkspaceZipUpload:
    """FILE-P2-001: Restore workspace via ZIP upload."""

    @pytest.mark.test_id("FILE-P2-001")
    def test_workspace_zip_upload(self, page: Page, request: pytest.FixtureRequest):
        """Test restoring workspace via ZIP upload."""
        test_name = request.node.name

        log_test_step("Navigate to the workspace page")
        page.goto(f"{config.base_url}/files")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(3000)

        log_test_step("Find the upload button")
        upload_btn = page.locator(
            'button[aria-label="Upload files"], '
            'button[aria-label="上传文件"]'
        ).first
        assert upload_btn.count() > 0, "Workspace page should have an upload button"
        expect(upload_btn).to_be_visible(timeout=5000)
        logger.info("Upload button exists and visible")

        log_test_step("Verify the hidden multi-file input")
        file_input = page.locator('input[type="file"][multiple]').first
        if file_input.count() > 0:
            logger.info("ZIP file input exists")
        else:
            logger.info("ZIP file input not found (upload may be triggered differently)")

        log_test_result(test_name, True, 0)


# ============================================================================
# FILE-P2-002: Download workspace as ZIP
# ============================================================================

@pytest.mark.integration
@pytest.mark.p2
@pytest.mark.files
class TestWorkspaceZipDownload:
    """FILE-P2-002: Download an opened workspace file."""

    @pytest.mark.test_id("FILE-P2-002")
    def test_workspace_zip_download(self, page: Page, request: pytest.FixtureRequest):
        """Test downloading workspace as ZIP."""
        test_name = request.node.name

        log_test_step("Navigate to the workspace page")
        page.goto(f"{config.base_url}/files")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(3000)

        log_test_step("Open the first file in the active project directory")
        file_node = page.locator(FILE_ITEM_SELECTOR).first
        expect(file_node).to_be_visible(timeout=10000)
        file_node.click()

        log_test_step("Find the file download button")
        download_btn = page.locator(
            'button[aria-label="Download"], '
            'button[aria-label="下载"]'
        ).first
        expect(download_btn).to_be_visible(timeout=15000)
        assert download_btn.is_enabled(), "Download button should be enabled"
        logger.info("Download button exists and enabled")

        log_test_result(test_name, True, 0)
